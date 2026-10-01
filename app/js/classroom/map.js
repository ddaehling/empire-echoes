import {
  feature,
  merge,
  geoEqualEarth,
  geoPath,
  geoGraticule,
} from "../../vendor/geo.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLORS = Object.freeze({
  sea: "#eaf0ed",
  land: "#e0e4de",
  extent: "#c77766",
  direct: "#b86755",
  indirect: "#d7b67c",
  selfGoverning: "#8caaa0",
  home: "#34594d",
  border: "#f1f3ef",
  selection: "#244c3e",
  selectedLand: "#c5d4cb",
});

export const MAP_LEGEND = Object.freeze({
  extent: [{ label: "British authority", color: COLORS.extent }],
  rule: [
    { label: "Direct authority", color: COLORS.direct },
    { label: "Indirect authority", color: COLORS.indirect },
    { label: "Limited authority", color: COLORS.selfGoverning },
  ],
});

// Scotland joined the English and Welsh state in 1707; a shared monarch from
// 1603 did not make the kingdoms one state.
const HOME_FROM = new Map([
  ["gb-england", -Infinity],
  ["gb-wales", 1536],
  ["gb-scotland", 1707],
]);
const FRAME = {
  type: "MultiPoint",
  coordinates: [
    [-180, 0],
    [180, 0],
    [0, 82],
    [0, -58],
  ],
};
let instanceCount = 0;

function element(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs))
    node.setAttribute(key, value);
  return node;
}

/** A self-contained, offline SVG atlas. The classroom's territory search is its
 * keyboard equivalent, so the world does not add hundreds of tab stops. */
export function createMap(container, { data, onSelect = () => {} }) {
  const topology = data.geo.coarse?.data;
  if (!topology?.objects?.units)
    throw new Error("The atlas geometry could not be loaded.");

  const prefix = `classroom-map-${++instanceCount}`;
  const features = feature(topology, topology.objects.units).features;
  const featureById = new Map(features.map((item) => [String(item.id), item]));
  const statusLabels = new Map(
    data.statuses.map((status) => [
      status.id,
      status.label || readable(status.id),
    ]),
  );
  const fallbackTerritories = new Map();
  const projection = geoEqualEarth();
  const path = geoPath(projection);
  let current = { year: 1920, mode: "extent", selectedId: null };
  let states = data.statusAt(current.year);
  let width = 900,
    height = 400;
  let zoom = 1,
    translateX = 0,
    translateY = 0;
  let pointer = null,
    dragged = false,
    destroyed = false;
  let selectedGeometry = null;
  let selectedAnchor = null;
  let hoveredUnit = null;
  const cleanups = [];

  const svg = element("svg", {
    class: "atlas-map",
    role: "img",
    "aria-labelledby": `${prefix}-title ${prefix}-description`,
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet",
  });
  Object.assign(svg.style, {
    display: "block",
    width: "100%",
    height: "100%",
    touchAction: "pan-y",
    userSelect: "none",
  });
  const title = element("title", { id: `${prefix}-title` });
  const description = element("desc", { id: `${prefix}-description` });
  description.textContent =
    "A world map using approximate modern boundaries. Select a territory to read its history; territory search provides the same information by keyboard. Hatched areas show partial control.";
  const defs = element("defs");
  const style = element("style");
  style.textContent = `
    .atlas-map .atlas-unit { transition: fill 180ms ease-out; }
    .atlas-map .atlas-unit[data-selectable="true"], .atlas-map .atlas-marker { cursor: pointer; }
    .atlas-map .atlas-unit.is-hovered { filter: brightness(.93); }
    .atlas-map .atlas-marker.is-hovered { stroke: ${COLORS.selection}; stroke-width: 2; }
    @media (prefers-reduced-motion: reduce) { .atlas-map .atlas-unit { transition: none; } }
  `;
  defs.append(style);
  for (const [name, color] of Object.entries(COLORS).filter(([name]) =>
    ["extent", "direct", "indirect", "selfGoverning"].includes(name),
  )) {
    const pattern = element("pattern", {
      id: `${prefix}-${name}-partial`,
      patternUnits: "userSpaceOnUse",
      width: 5,
      height: 5,
      patternTransform: "rotate(35)",
    });
    pattern.append(
      element("rect", { width: 5, height: 5, fill: color, opacity: ".54" }),
    );
    pattern.append(
      element("line", {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 5,
        stroke: color,
        "stroke-width": 2,
      }),
    );
    defs.append(pattern);
  }
  const sea = element("rect", {
    width: "100%",
    height: "100%",
    fill: COLORS.sea,
  });
  const world = element("g", { class: "atlas-world" });
  const landLayer = element("g", {
    fill: COLORS.land,
    "pointer-events": "none",
  });
  const gridLayer = element("path", {
    fill: "none",
    stroke: "#cad8d0",
    "stroke-width": ".55",
    opacity: ".62",
    "vector-effect": "non-scaling-stroke",
    "pointer-events": "none",
  });
  const unitLayer = element("g");
  const lakeLayer = element("g", {
    fill: COLORS.sea,
    "pointer-events": "none",
  });
  const selectedOutline = element("path", {
    class: "atlas-selection",
    fill: "none",
    stroke: COLORS.selection,
    "stroke-width": 1.8,
    "stroke-linejoin": "round",
    "vector-effect": "non-scaling-stroke",
    "pointer-events": "none",
  });
  const selectedMarker = element("circle", {
    class: "atlas-selection-marker",
    fill: "none",
    stroke: COLORS.selection,
    "stroke-width": 1.8,
    "vector-effect": "non-scaling-stroke",
    "pointer-events": "none",
    display: "none",
  });
  const markerLayer = element("g");
  const labelLayer = element("g", {
    "pointer-events": "none",
    "aria-hidden": "true",
  });
  const shapeNodes = new Map();
  const markers = new Map();
  const labels = [];
  const graticule = geoGraticule()
    .step([30, 30])
    .extent([
      [-180, -60],
      [180, 80],
    ])();

  const landTopology = data.geo.land?.data;
  const landGeometry = landTopology?.objects?.land
    ? feature(landTopology, landTopology.objects.land)
    : null;
  const lakeGeometry = landTopology?.objects?.lakes
    ? feature(landTopology, landTopology.objects.lakes)
    : null;
  const landShape = landGeometry ? element("path") : null;
  const lakeShape = lakeGeometry ? element("path") : null;
  if (landShape) landLayer.append(landShape);
  if (lakeShape) lakeLayer.append(lakeShape);

  for (const item of features) {
    const id = String(item.id);
    const node = element("path", {
      class: "atlas-unit",
      "data-unit": id,
      fill: COLORS.land,
      stroke: COLORS.border,
      "stroke-width": ".45",
      "stroke-linejoin": "round",
      "vector-effect": "non-scaling-stroke",
    });
    shapeNodes.set(id, node);
    unitLayer.append(node);
    const meta = data.unitMeta?.get(id);
    if (meta?.tiny && meta.point) {
      const marker = element("circle", {
        class: "atlas-marker",
        "data-unit": id,
        r: 2.5,
        stroke: COLORS.border,
        "stroke-width": ".8",
        "vector-effect": "non-scaling-stroke",
      });
      markers.set(id, { node: marker, point: meta.point });
      markerLayer.append(marker);
    }
  }

  const labelSpecs = [
    ["Pacific Ocean", [-133, -4], "ocean"],
    ["Atlantic Ocean", [-32, 8], "ocean"],
    ["Indian Ocean", [77, -25], "ocean"],
    ["Canada", [-106, 55], "land"],
    ["Britain", [-2, 55], "britain"],
    ["India", [79, 22], "land"],
    ["Australia", [134, -25], "land"],
  ];
  for (const [text, point, kind] of labelSpecs) {
    const node = element("text", {
      "text-anchor": kind === "britain" ? "start" : "middle",
      "font-family":
        kind === "ocean"
          ? "Source Serif 4, Georgia, serif"
          : "Source Sans 3, sans-serif",
      "font-size": kind === "ocean" ? 12 : 11,
      "font-style": kind === "ocean" ? "italic" : "normal",
      "font-weight": kind === "ocean" ? 400 : 600,
      fill: kind === "ocean" ? "#556f63" : "#3d5449",
      "paint-order": "stroke",
      stroke: COLORS.sea,
      "stroke-width": kind === "ocean" ? 0 : 2.5,
      "stroke-linejoin": "round",
    });
    node.textContent = text;
    labels.push({ node, point, kind });
    labelLayer.append(node);
  }

  world.append(
    landLayer,
    gridLayer,
    unitLayer,
    lakeLayer,
    selectedOutline,
    markerLayer,
    selectedMarker,
    labelLayer,
  );
  svg.append(title, description, defs, sea, world);
  const tooltip = document.createElement("div");
  tooltip.className = "atlas-tooltip";
  tooltip.hidden = true;
  tooltip.setAttribute("aria-hidden", "true");
  Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    zIndex: "2",
  });
  const tooltipName = document.createElement("strong");
  const tooltipStatus = document.createElement("span");
  tooltipName.style.display = "block";
  tooltipStatus.style.display = "block";
  tooltip.append(tooltipName, tooltipStatus);
  if (getComputedStyle(container).position === "static")
    container.style.position = "relative";
  container.append(svg, tooltip);

  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    cleanups.push(() => target.removeEventListener(type, callback, options));
  }

  function territoryFor(id) {
    const state = states.get(id);
    if (state?.territory) return state.territory;
    if (!fallbackTerritories.has(id)) {
      const territories = [...data.territoriesForUnit(id)];
      territories.sort(
        (a, b) => (b.acquiredYear ?? -Infinity) - (a.acquiredYear ?? -Infinity),
      );
      fallbackTerritories.set(id, territories);
    }
    const candidates = fallbackTerritories.get(id);
    return (
      candidates.find((item) => item.acquiredYear <= current.year) ||
      candidates.at(-1) ||
      null
    );
  }

  function fillFor(state) {
    const name =
      current.mode !== "rule"
        ? "extent"
        : state.controlDegree >= 4
          ? "direct"
          : state.controlDegree >= 2
            ? "indirect"
            : "selfGoverning";
    return state.partial ? `url(#${prefix}-${name}-partial)` : COLORS[name];
  }

  function update(next = {}) {
    if (destroyed) return;
    current = { ...current, ...next };
    states = data.statusAt(current.year);
    hideTooltip();
    const selectedUnits = new Set(
      current.selectedId ? data.unitsOf(current.selectedId, current.year) : [],
    );
    const highlighted = new Set();
    for (const [id, node] of shapeNodes) {
      const state = states.get(id);
      const isSelected = selectedUnits.has(id);
      const home = HOME_FROM.has(id) && current.year >= HOME_FROM.get(id);
      const controlled = !!state?.controlled;
      if (controlled && !home) highlighted.add(state.territoryId);
      const fill = home
        ? COLORS.home
        : controlled
          ? fillFor(state)
          : isSelected
            ? COLORS.selectedLand
            : COLORS.land;
      node.setAttribute("fill", fill);
      node.dataset.selectable = String(!!territoryFor(id));
      node.classList.toggle("is-selected", isSelected);
      const marker = markers.get(id)?.node;
      if (marker) {
        marker.style.display = controlled || isSelected ? "" : "none";
        marker.setAttribute(
          "fill",
          controlled ? fillFor(state) : COLORS.selectedLand,
        );
        marker.setAttribute(
          "stroke",
          isSelected ? COLORS.selection : COLORS.border,
        );
      }
    }
    selectedGeometry = selectedUnits.size
      ? merge(
          topology,
          topology.objects.units.geometries.filter((item) =>
            selectedUnits.has(String(item.id)),
          ),
        )
      : null;
    selectedAnchor =
      [...selectedUnits]
        .map((id) => data.unitMeta?.get(id))
        .filter((meta) => meta?.point)
        .sort((a, b) => (b.area_km2 || 0) - (a.area_km2 || 0))[0]?.point ||
      null;
    selectedOutline.setAttribute(
      "d",
      selectedGeometry ? path(selectedGeometry) || "" : "",
    );
    const homeLabel = labels.find((label) => label.kind === "britain");
    homeLabel.node.textContent = current.year < 1707 ? "England" : "Britain";
    homeLabel.point = current.year < 1707 ? [-1, 53] : [-2, 55];
    const [homeX, homeY] = projection(homeLabel.point);
    homeLabel.node.setAttribute("x", homeX + 9);
    homeLabel.node.setAttribute("y", homeY - 5);
    updateSelectionMarker();
    title.textContent = `British imperial authority during ${current.year}. ${highlighted.size} historical territories highlighted. ${current.mode === "rule" ? "Colours distinguish direct authority, indirect authority and limited authority." : "Coral shows territories under British authority."}`;
  }

  function resize() {
    if (destroyed) return;
    const bounds = container.getBoundingClientRect();
    const oldWidth = width,
      oldHeight = height;
    width = Math.max(1, bounds.width || 900);
    height = Math.max(1, bounds.height || 400);
    translateX *= width / oldWidth;
    translateY *= height / oldHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    projection.fitExtent(
      [
        [16, 18],
        [Math.max(17, width - 16), Math.max(19, height - 18)],
      ],
      FRAME,
    );
    if (landShape) landShape.setAttribute("d", path(landGeometry) || "");
    if (lakeShape) lakeShape.setAttribute("d", path(lakeGeometry) || "");
    gridLayer.setAttribute("d", path(graticule) || "");
    for (const [id, node] of shapeNodes)
      node.setAttribute("d", path(featureById.get(id)) || "");
    for (const { node, point } of markers.values()) {
      const [x, y] = projection(point);
      node.setAttribute("cx", x);
      node.setAttribute("cy", y);
    }
    for (const { node, point, kind } of labels) {
      const [x, y] = projection(point);
      node.setAttribute("x", x + (kind === "britain" ? 9 : 0));
      node.setAttribute("y", y + (kind === "britain" ? -5 : 0));
      node.style.display = width < 500 && kind === "land" ? "none" : "";
      node.setAttribute(
        "font-size",
        kind === "ocean" ? (width < 500 ? 10 : 12) : 11,
      );
    }
    selectedOutline.setAttribute(
      "d",
      selectedGeometry ? path(selectedGeometry) || "" : "",
    );
    applyTransform();
  }

  function applyTransform() {
    translateX = Math.max(width * (1 - zoom), Math.min(0, translateX));
    translateY = Math.max(height * (1 - zoom), Math.min(0, translateY));
    world.setAttribute(
      "transform",
      `translate(${translateX} ${translateY}) scale(${zoom})`,
    );
    svg.style.cursor = zoom > 1 ? (pointer ? "grabbing" : "grab") : "";
    for (const { node } of markers.values()) node.setAttribute("r", 2.7 / zoom);
    for (const { node, kind } of labels) {
      const fontSize = kind === "ocean" ? (width < 500 ? 10 : 12) : 11;
      node.setAttribute("font-size", fontSize / Math.sqrt(zoom));
      node.style.opacity = zoom > 2.4 && kind === "ocean" ? "0" : "1";
    }
    updateSelectionMarker();
  }

  function updateSelectionMarker() {
    if (!selectedGeometry || !selectedAnchor) {
      selectedMarker.setAttribute("display", "none");
      return;
    }
    const [[x0, y0], [x1, y1]] = path.bounds(selectedGeometry);
    const small = Math.max(x1 - x0, y1 - y0) * zoom < 16;
    selectedMarker.setAttribute("display", small ? "" : "none");
    if (small) {
      const [x, y] = projection(selectedAnchor);
      selectedMarker.setAttribute("cx", x);
      selectedMarker.setAttribute("cy", y);
      selectedMarker.setAttribute("r", 6.5 / zoom);
    }
  }

  function zoomBy(factor) {
    if (destroyed || !Number.isFinite(factor) || factor <= 0) return;
    const next = Math.max(1, Math.min(5, zoom * factor));
    translateX = width / 2 - ((width / 2 - translateX) / zoom) * next;
    translateY = height / 2 - ((height / 2 - translateY) / zoom) * next;
    zoom = next;
    hideTooltip();
    applyTransform();
  }

  function reset() {
    zoom = 1;
    translateX = 0;
    translateY = 0;
    hideTooltip();
    applyTransform();
  }

  function hideTooltip() {
    tooltip.hidden = true;
    if (hoveredUnit) {
      shapeNodes.get(hoveredUnit)?.classList.remove("is-hovered");
      markers.get(hoveredUnit)?.node.classList.remove("is-hovered");
      hoveredUnit = null;
    }
  }

  function showTooltip(event, id) {
    const territory = territoryFor(id);
    if (!territory) {
      hideTooltip();
      return;
    }
    if (hoveredUnit !== id) {
      hideTooltip();
      hoveredUnit = id;
      shapeNodes.get(id)?.classList.add("is-hovered");
      markers.get(id)?.node.classList.add("is-hovered");
    }
    const state = states.get(id);
    tooltipName.textContent = territory.shortName || territory.name;
    tooltipStatus.textContent = state?.controlled
      ? `${statusLabels.get(state.status) || readable(state.status)}${state.partial ? " · partial control" : ""} · ${current.year}`
      : `Outside British authority in ${current.year}`;
    tooltip.hidden = false;
    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left + 14;
    const y = event.clientY - bounds.top + 16;
    tooltip.style.left = `${Math.max(8, Math.min(x, width - tooltip.offsetWidth - 8))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(y, height - tooltip.offsetHeight - 8))}px`;
  }

  listen(svg, "pointermove", (event) => {
    if (pointer && pointer.id === event.pointerId) {
      const dx = event.clientX - pointer.x,
        dy = event.clientY - pointer.y;
      if (!dragged && Math.abs(dx) + Math.abs(dy) > 5) {
        dragged = true;
        svg.setPointerCapture(event.pointerId);
      }
      if (dragged) {
        translateX = pointer.translateX + dx;
        translateY = pointer.translateY + dy;
        hideTooltip();
        applyTransform();
        return;
      }
    }
    if (event.pointerType === "touch") return;
    const unit = event.target.closest?.("[data-unit]");
    if (unit) showTooltip(event, unit.dataset.unit);
    else hideTooltip();
  });
  listen(svg, "pointerleave", hideTooltip);
  listen(svg, "pointerdown", (event) => {
    dragged = false;
    if (zoom <= 1 || event.button !== 0 || event.pointerType !== "mouse")
      return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      translateX,
      translateY,
    };
    applyTransform();
  });
  function endPointer(event) {
    if (pointer?.id !== event.pointerId) return;
    if (svg.hasPointerCapture(event.pointerId))
      svg.releasePointerCapture(event.pointerId);
    pointer = null;
    applyTransform();
  }
  listen(window, "pointerup", endPointer);
  listen(window, "pointercancel", endPointer);
  listen(svg, "click", (event) => {
    if (dragged) {
      dragged = false;
      return;
    }
    const unit = event.target.closest?.("[data-unit]");
    if (!unit) return;
    const territory = territoryFor(unit.dataset.unit);
    if (territory) {
      hideTooltip();
      onSelect(territory.id);
    }
  });

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();
  update();

  return {
    update,
    zoomBy,
    reset,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      svg.remove();
      tooltip.remove();
    },
  };
}

function readable(value = "") {
  return value
    .replace(/-/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
