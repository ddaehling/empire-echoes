import * as THREE from "../vendor/three.module.js";
import {
  feature,
  merge,
  geoPath,
  geoEquirectangular,
  geoGraticule,
  geoContains,
  geoCentroid,
} from "../../vendor/geo.js";

const COLOR = Object.freeze({
  sea: "#cbdcd6",
  land: "#e0e4de",
  border: "#f2f3ec",
  extent: "#c77766",
  direct: "#b86755",
  indirect: "#d7b67c",
  limited: "#8caaa0",
  home: "#34594d",
  selected: "#214a3b",
  selectedLand: "#acbfb3",
  grid: "#afc9be",
});
const HOME_FROM = new Map([
  ["gb-england", -Infinity],
  ["gb-wales", 1536],
  ["gb-scotland", 1707],
]);
const INITIAL_VIEW = Object.freeze({ longitude: 24, latitude: 20, zoom: 1 });
const DEG = Math.PI / 180;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const wrapLongitude = (value) => ((((value + 180) % 360) + 360) % 360) - 180;
const readable = (value) =>
  String(value || "")
    .replaceAll("-", " ")
    .replace(/^./, (letter) => letter.toUpperCase());

// SphereGeometry's unmodified UVs put longitude zero on +X and 90°E on −Z.
// This matches a north-up equirectangular canvas, including Texture.flipY.
function onSphere(longitude, latitude, radius = 1) {
  const lon = longitude * DEG,
    lat = latitude * DEG;
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon),
  ).multiplyScalar(radius);
}

/**
 * A demand-rendered globe built entirely from the atlas's local data.
 *
 * createGlobe(container, { data, onSelect, onReady, onFallback }) returns a Promise.
 * A WebGL2/initialization failure rejects it so the caller can show its 2D map.
 * Later context loss calls optional onFallback(error) (or onError) and emits `globeerror`.
 * The caller owns the container's size and the surrounding search/legend UI.
 */
export async function createGlobe(
  container,
  { data, onSelect = () => {}, onReady, onError, onFallback } = {},
) {
  const topology = data?.geo?.coarse?.data;
  if (!topology?.objects?.units)
    throw new Error("The globe geometry is unavailable.");

  const canvas = document.createElement("canvas");
  canvas.className = "globe-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-roledescription", "interactive globe");
  canvas.setAttribute(
    "aria-keyshortcuts",
    "ArrowLeft ArrowRight ArrowUp ArrowDown Home Enter + -",
  );
  canvas.tabIndex = 0;
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
    touchAction: "pan-y pinch-zoom",
    cursor: "grab",
  });
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!context)
    throw new Error("WebGL2 is unavailable. Please use the flat map.");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      alpha: true,
      antialias: true,
    });
  } catch (error) {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    throw new Error("The 3D globe could not start. Please use the flat map.", {
      cause: error,
    });
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 30);
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const disposables = new Set();
  const cleanups = [];
  const own = (resource) => {
    disposables.add(resource);
    return resource;
  };
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = media.matches;
  let current = { year: 1920, mode: "extent", selectedId: null };
  let states = data.statusAt(current.year);
  let view = { ...INITIAL_VIEW };
  let width = 850,
    height = 490,
    baseDistance = 3.7;
  let active = true,
    destroyed = false,
    ready = false,
    contextLost = false;
  let loopRunning = false,
    dirty = true,
    textureDirty = true;
  let tween = null,
    pointer = null,
    dragDistance = 0;
  let selectedGeometry = null,
    selectedPoint = null;
  let lastHoverTime = 0;
  let initTimer = null,
    shaderError = null;
  let resizeObserver;

  const textureSize = Math.min(2048, renderer.capabilities.maxTextureSize);
  const textureCanvas = document.createElement("canvas");
  const baseCanvas = document.createElement("canvas");
  textureCanvas.width = baseCanvas.width = textureSize;
  textureCanvas.height = baseCanvas.height = textureSize / 2;
  const textureContext = textureCanvas.getContext("2d", { alpha: false });
  const baseContext = baseCanvas.getContext("2d", { alpha: false });
  if (!textureContext || !baseContext) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw new Error("The atlas texture could not be created.");
  }
  const projection = geoEquirectangular()
    .translate([textureSize / 2, textureSize / 4])
    .scale(textureSize / (2 * Math.PI))
    .precision(0.2);
  const path = geoPath(projection);
  const unitFeatures = feature(topology, topology.objects.units).features;
  const units = unitFeatures.map((item) => ({
    id: String(item.id),
    feature: item,
    path: new Path2D(path(item) || ""),
    meta: data.unitMeta?.get(String(item.id)),
  }));
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const statusLabels = new Map(
    data.statuses.map((status) => [
      status.id,
      status.label || readable(status.id),
    ]),
  );
  const fallbackByUnit = new Map();
  const landTopology = data.geo.land?.data;
  const land = landTopology?.objects?.land
    ? feature(landTopology, landTopology.objects.land)
    : null;
  const lakes = landTopology?.objects?.lakes
    ? feature(landTopology, landTopology.objects.lakes)
    : null;
  const lakePath = lakes ? new Path2D(path(lakes) || "") : null;
  const partialPatterns = new Map();

  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    cleanups.push(() => target.removeEventListener(type, callback, options));
  }

  function buildBaseTexture() {
    baseContext.fillStyle = COLOR.sea;
    baseContext.fillRect(0, 0, textureSize, textureSize / 2);
    baseContext.fillStyle = COLOR.land;
    if (land) baseContext.fill(new Path2D(path(land) || ""));
    for (const unit of units) baseContext.fill(unit.path);
    baseContext.strokeStyle = COLOR.grid;
    baseContext.lineWidth = 0.65;
    baseContext.globalAlpha = 0.56;
    baseContext.stroke(new Path2D(path(geoGraticule().step([20, 20])()) || ""));
    baseContext.globalAlpha = 1;
    baseContext.strokeStyle = COLOR.border;
    baseContext.lineWidth = 0.65;
    for (const unit of units) baseContext.stroke(unit.path);
    if (lakePath) {
      baseContext.fillStyle = COLOR.sea;
      baseContext.fill(lakePath);
    }
  }

  function patternFor(color) {
    if (partialPatterns.has(color)) return partialPatterns.get(color);
    const tile = document.createElement("canvas");
    tile.width = 9;
    tile.height = 9;
    const ctx = tile.getContext("2d");
    ctx.fillStyle = COLOR.land;
    ctx.fillRect(0, 0, 9, 9);
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 9, 9);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const x of [-9, 0, 9]) {
      ctx.moveTo(x, 9);
      ctx.lineTo(x + 9, 0);
    }
    ctx.stroke();
    const pattern = textureContext.createPattern(tile, "repeat");
    partialPatterns.set(color, pattern);
    return pattern;
  }

  function colorFor(state) {
    return current.mode === "rule"
      ? state.controlDegree >= 4
        ? COLOR.direct
        : state.controlDegree >= 2
          ? COLOR.indirect
          : COLOR.limited
      : COLOR.extent;
  }

  function paintTexture() {
    textureContext.drawImage(baseCanvas, 0, 0);
    const selectedUnits = new Set(
      current.selectedId ? data.unitsOf(current.selectedId, current.year) : [],
    );
    for (const unit of units) {
      const state = states.get(unit.id);
      const home =
        HOME_FROM.has(unit.id) && current.year >= HOME_FROM.get(unit.id);
      const selected = selectedUnits.has(unit.id);
      if (!state?.controlled && !home && !selected) continue;
      const color = home
        ? COLOR.home
        : state?.controlled
          ? colorFor(state)
          : COLOR.selectedLand;
      textureContext.fillStyle =
        state?.controlled && state.partial && !home ? patternFor(color) : color;
      textureContext.fill(unit.path);
      textureContext.strokeStyle = COLOR.border;
      textureContext.lineWidth = 0.75;
      textureContext.stroke(unit.path);
      if (unit.meta?.tiny && unit.meta.point && state?.controlled) {
        const [x, y] = projection(unit.meta.point);
        textureContext.fillStyle = color;
        textureContext.beginPath();
        textureContext.arc(x, y, 2.3, 0, Math.PI * 2);
        textureContext.fill();
      }
    }
    if (lakePath) {
      textureContext.fillStyle = COLOR.sea;
      textureContext.fill(lakePath);
    }
    selectedGeometry = selectedUnits.size
      ? merge(
          topology,
          topology.objects.units.geometries.filter((item) =>
            selectedUnits.has(String(item.id)),
          ),
        )
      : null;
    selectedPoint =
      [...selectedUnits]
        .map((id) => unitsById.get(id)?.meta)
        .filter((meta) => meta?.point)
        .sort((a, b) => (b.area_km2 || 0) - (a.area_km2 || 0))[0]?.point ||
      null;
    if (selectedGeometry) {
      textureContext.strokeStyle = COLOR.selected;
      textureContext.lineJoin = "round";
      textureContext.lineWidth = 3;
      textureContext.stroke(new Path2D(path(selectedGeometry) || ""));
    }
    updateMarker();
    texture.needsUpdate = true;
    textureDirty = false;
  }

  buildBaseTexture();
  const texture = own(new THREE.CanvasTexture(textureCanvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const sphereGeometry = own(new THREE.SphereGeometry(1, 128, 80));
  const surfaceMaterial = own(
    new THREE.ShaderMaterial({
      uniforms: { atlas: { value: texture } },
      vertexShader: `
      varying vec2 atlasUv;
      varying vec3 viewNormal;
      varying vec3 viewPosition;
      void main() {
        atlasUv = uv;
        viewNormal = normalize(normalMatrix * normal);
        vec4 positionInView = modelViewMatrix * vec4(position, 1.0);
        viewPosition = positionInView.xyz;
        gl_Position = projectionMatrix * positionInView;
      }
    `,
      fragmentShader: `
      uniform sampler2D atlas;
      varying vec2 atlasUv;
      varying vec3 viewNormal;
      varying vec3 viewPosition;
      void main() {
        vec3 normal = normalize(viewNormal);
        vec3 toViewer = normalize(-viewPosition);
        vec3 keyLight = normalize(vec3(-0.48, 0.65, 1.0));
        float diffuse = max(dot(normal, keyLight), 0.0);
        float sheen = pow(max(dot(reflect(-keyLight, normal), toViewer), 0.0), 42.0) * 0.025;
        vec3 atlasColor = texture2D(atlas, atlasUv).rgb;
        vec3 litColor = atlasColor * (0.65 + 0.38 * diffuse) + vec3(sheen);
        gl_FragColor = vec4(litColor, 1.0);
        #include <colorspace_fragment>
      }
    `,
    }),
  );
  const globe = new THREE.Mesh(sphereGeometry, surfaceMaterial);
  scene.add(globe);

  // A narrow, depth-tested outer atmosphere gives the sphere a readable edge
  // without a post-processing pipeline, a blurred canvas, or a permanent loop.
  const atmosphereMaterial = own(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: { rimColor: { value: new THREE.Color("#b4cfc3") } },
      vertexShader: `
      varying vec3 rimNormal;
      varying vec3 rimPosition;
      void main() {
        rimNormal = normalize(normalMatrix * normal);
        vec4 p = modelViewMatrix * vec4(position, 1.0);
        rimPosition = p.xyz;
        gl_Position = projectionMatrix * p;
      }
    `,
      fragmentShader: `
      uniform vec3 rimColor;
      varying vec3 rimNormal;
      varying vec3 rimPosition;
      void main() {
        float edge = 1.0 - abs(dot(normalize(rimNormal), normalize(-rimPosition)));
        float alpha = pow(max(edge, 0.0), 3.0) * 0.28;
        gl_FragColor = vec4(rimColor, alpha);
        #include <colorspace_fragment>
      }
    `,
    }),
  );
  const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
  atmosphere.scale.setScalar(1.027);
  scene.add(atmosphere);

  const marker = new THREE.Group();
  const whiteRing = new THREE.Mesh(
    own(new THREE.RingGeometry(0.019, 0.026, 48)),
    own(
      new THREE.MeshBasicMaterial({ color: "#f8fbf7", side: THREE.DoubleSide }),
    ),
  );
  const darkRing = new THREE.Mesh(
    own(new THREE.RingGeometry(0.012, 0.019, 48)),
    own(
      new THREE.MeshBasicMaterial({
        color: COLOR.selected,
        side: THREE.DoubleSide,
      }),
    ),
  );
  const markerDot = new THREE.Mesh(
    own(new THREE.CircleGeometry(0.005, 24)),
    own(
      new THREE.MeshBasicMaterial({
        color: COLOR.selected,
        side: THREE.DoubleSide,
      }),
    ),
  );
  marker.add(whiteRing, darkRing, markerDot);
  marker.visible = false;
  scene.add(marker);

  const tooltip = document.createElement("div");
  tooltip.className = "atlas-tooltip globe-tooltip";
  tooltip.hidden = true;
  tooltip.setAttribute("aria-hidden", "true");
  Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    zIndex: "4",
    maxWidth: "240px",
  });
  const tooltipName = document.createElement("strong");
  const tooltipStatus = document.createElement("span");
  tooltipName.style.display = tooltipStatus.style.display = "block";
  tooltip.append(tooltipName, tooltipStatus);
  if (getComputedStyle(container).position === "static")
    container.style.position = "relative";

  function updateMarker() {
    marker.visible = !!selectedPoint;
    if (!selectedPoint) return;
    const normal = onSphere(...selectedPoint);
    marker.position.copy(normal).multiplyScalar(1.009);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }

  function applyView() {
    const distance = Math.max(1.3, baseDistance / view.zoom);
    camera.position.copy(onSphere(view.longitude, view.latitude, distance));
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const pixelsPerUnit = height / (2 * Math.tan(18 * DEG) * distance);
    marker.scale.setScalar(6.2 / (0.026 * pixelsPerUnit));
  }

  function stopLoop() {
    loopRunning = false;
    // Three schedules its next frame after invoking our callback. Stop in the
    // microtask that follows it, so that newly scheduled frame is cancelled too.
    queueMicrotask(() => {
      if (!loopRunning) renderer.setAnimationLoop(null);
    });
  }

  function canRender() {
    return !destroyed && active && !document.hidden && !contextLost;
  }

  function requestRender() {
    dirty = true;
    if (ready && canRender() && !loopRunning) {
      loopRunning = true;
      renderer.setAnimationLoop(renderFrame);
    }
  }

  function renderFrame(time) {
    if (!canRender()) {
      stopLoop();
      return;
    }
    if (tween) {
      const progress = clamp((time - tween.started) / tween.duration, 0, 1);
      const eased = 1 - (1 - progress) ** 4;
      for (const key of ["longitude", "latitude", "zoom"])
        view[key] = tween.from[key] + (tween.to[key] - tween.from[key]) * eased;
      if (progress === 1) {
        view.longitude = wrapLongitude(view.longitude);
        tween = null;
      }
      dirty = true;
    }
    if (dirty) {
      if (textureDirty) paintTexture();
      applyView();
      renderer.render(scene, camera);
      dirty = false;
    }
    if (!tween) stopLoop();
  }

  function animateView(next, duration = 520) {
    hideTooltip();
    const target = { ...view, ...next };
    target.latitude = clamp(target.latitude, -80, 80);
    target.zoom = clamp(target.zoom, 0.8, 2.3);
    target.longitude =
      view.longitude + wrapLongitude(target.longitude - view.longitude);
    if (reducedMotion || !active || document.hidden) {
      view = target;
      tween = null;
    } else
      tween = {
        from: { ...view },
        to: target,
        started: performance.now(),
        duration,
      };
    requestRender();
  }

  function resize() {
    if (destroyed) return;
    const bounds = container.getBoundingClientRect();
    if (bounds.width < 2 || bounds.height < 2) return;
    width = bounds.width;
    height = bounds.height;
    const pixelRadius = Math.min(width, height) * 0.435;
    const focalLength = height / (2 * Math.tan(18 * DEG));
    baseDistance = Math.sqrt(1 + (focalLength / pixelRadius) ** 2);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    requestRender();
  }

  function update(next = {}) {
    if (destroyed) return;
    const candidate = { ...current, ...next };
    const year = Number(candidate.year);
    candidate.year = Number.isFinite(year) ? Math.round(year) : current.year;
    candidate.mode = candidate.mode === "rule" ? "rule" : "extent";
    if (
      candidate.year !== current.year ||
      candidate.mode !== current.mode ||
      candidate.selectedId !== current.selectedId
    )
      textureDirty = true;
    current = candidate;
    states = data.statusAt(current.year);
    canvas.setAttribute(
      "aria-label",
      `Interactive globe of British authority during ${current.year}. ${current.mode === "rule" ? "Colours distinguish direct, indirect and limited authority." : "Coral shows British authority."} Hatched areas show partial control. Boundaries are approximate. Arrow keys rotate, plus and minus zoom, and Home resets. Place search provides every territory by keyboard.`,
    );
    hideTooltip();
    requestRender();
  }

  function territoryFor(unitId) {
    const state = states.get(unitId);
    if (state?.territory) return state.territory;
    if (!fallbackByUnit.has(unitId)) {
      fallbackByUnit.set(
        unitId,
        [...data.territoriesForUnit(unitId)].sort(
          (a, b) =>
            (b.acquiredYear ?? -Infinity) - (a.acquiredYear ?? -Infinity),
        ),
      );
    }
    const records = fallbackByUnit.get(unitId);
    return (
      records.find((record) => record.acquiredYear <= current.year) ||
      records.at(-1) ||
      null
    );
  }

  function hitAt(clientX, clientY) {
    if (!ready || !active || contextLost) return null;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    ndc.set(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const intersection = raycaster.intersectObject(globe, false)[0];
    if (!intersection) return null;
    const longitude = wrapLongitude(intersection.uv.x * 360 - 180);
    const latitude = intersection.uv.y * 180 - 90;
    const point = [longitude, latitude];
    for (const unit of units) {
      const bbox = unit.meta?.bbox;
      if (bbox) {
        if (latitude < bbox[1] || latitude > bbox[3]) continue;
        if (
          bbox[0] <= bbox[2]
            ? longitude < bbox[0] || longitude > bbox[2]
            : longitude < bbox[0] && longitude > bbox[2]
        )
          continue;
      }
      if (geoContains(unit.feature, point)) {
        const territory = territoryFor(unit.id);
        return territory
          ? { unit, territory, state: states.get(unit.id), point }
          : null;
      }
    }
    // Small islands have real geometry, but their displayed point needs a
    // usable hit area. Only points on the visible hemisphere can be picked.
    let nearest = null,
      nearestDistance = 9;
    for (const unit of units) {
      if (
        !unit.meta?.tiny ||
        !unit.meta.point ||
        !states.get(unit.id)?.controlled
      )
        continue;
      const normal = onSphere(...unit.meta.point);
      if (normal.dot(camera.position) < 1.005) continue;
      const projected = normal.clone().project(camera);
      const x = bounds.left + ((projected.x + 1) * bounds.width) / 2;
      const y = bounds.top + ((1 - projected.y) * bounds.height) / 2;
      const distance = Math.hypot(x - clientX, y - clientY);
      if (distance < nearestDistance) {
        const territory = territoryFor(unit.id);
        if (territory) {
          nearestDistance = distance;
          nearest = {
            unit,
            territory,
            state: states.get(unit.id),
            point: unit.meta.point,
          };
        }
      }
    }
    return nearest;
  }

  function hideTooltip() {
    tooltip.hidden = true;
    if (!pointer?.dragging) canvas.style.cursor = "grab";
  }

  function showTooltip(event) {
    const hit = hitAt(event.clientX, event.clientY);
    if (!hit) {
      hideTooltip();
      return;
    }
    canvas.style.cursor = "pointer";
    tooltipName.textContent = hit.territory.shortName || hit.territory.name;
    tooltipStatus.textContent = hit.state?.controlled
      ? `${statusLabels.get(hit.state.status) || readable(hit.state.status)}${hit.state.partial ? " · partial control" : ""} · ${current.year}`
      : `Outside British authority in ${current.year}`;
    tooltip.hidden = false;
    const bounds = container.getBoundingClientRect();
    tooltip.style.left = `${clamp(event.clientX - bounds.left + 14, 8, Math.max(8, width - tooltip.offsetWidth - 8))}px`;
    tooltip.style.top = `${clamp(event.clientY - bounds.top + 16, 8, Math.max(8, height - tooltip.offsetHeight - 8))}px`;
  }

  function selectAt(clientX, clientY) {
    const hit = hitAt(clientX, clientY);
    if (hit) {
      hideTooltip();
      onSelect(hit.territory.id);
    }
  }

  function zoomBy(factor) {
    if (destroyed || !Number.isFinite(factor) || factor <= 0) return;
    animateView({ zoom: (tween?.to.zoom || view.zoom) * factor }, 300);
  }

  function reset() {
    if (!destroyed) animateView(INITIAL_VIEW, 560);
  }

  function focusTerritory(id) {
    if (destroyed || !data.get(id)) return false;
    const ids = new Set(data.unitsOf(id, current.year));
    const geometries = topology.objects.units.geometries.filter((item) =>
      ids.has(String(item.id)),
    );
    if (!geometries.length) return false;
    const geometry = merge(topology, geometries);
    let center = geoCentroid(geometry);
    if (!center.every(Number.isFinite))
      center = [...ids]
        .map((unitId) => unitsById.get(unitId)?.meta?.point)
        .find(Boolean);
    if (!center) return false;
    animateView({ longitude: center[0], latitude: center[1] });
    return true;
  }

  function setActive(value) {
    if (destroyed) return;
    active = !!value;
    canvas.tabIndex = active ? 0 : -1;
    canvas.setAttribute("aria-hidden", String(!active));
    if (!active) {
      tween = null;
      stopLoop();
      hideTooltip();
      pointer = null;
    } else {
      resize();
      requestRender();
    }
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    active = false;
    clearTimeout(initTimer);
    stopLoop();
    resizeObserver?.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    cleanups.length = 0;
    for (const resource of disposables) resource.dispose();
    disposables.clear();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    tooltip.remove();
    textureCanvas.width = baseCanvas.width = 1;
    textureCanvas.height = baseCanvas.height = 1;
    partialPatterns.clear();
    fallbackByUnit.clear();
    unitsById.clear();
    pointer = tween = null;
  }

  const api = { update, zoomBy, reset, focusTerritory, setActive, destroy };

  try {
    renderer.debug.onShaderError = (gl, program) => {
      shaderError = new Error(
        `The globe shader failed to compile: ${gl.getProgramInfoLog(program) || "unknown shader error"}`,
      );
    };
    listen(canvas, "webglcontextlost", (event) => {
      event.preventDefault();
      if (destroyed) return;
      contextLost = true;
      tween = null;
      stopLoop();
      hideTooltip();
      if (ready) {
        const error = new Error(
          "The graphics context was lost. Please use the flat map.",
        );
        (onFallback || onError)?.(error);
        container.dispatchEvent(
          new CustomEvent("globeerror", { detail: error, bubbles: true }),
        );
      }
    });
    listen(canvas, "pointerdown", (event) => {
      if (!active || event.button !== 0 || contextLost) return;
      tween = null;
      dragDistance = 0;
      pointer = {
        id: event.pointerId,
        type: event.pointerType,
        x: event.clientX,
        y: event.clientY,
        longitude: view.longitude,
        latitude: view.latitude,
        dragging: false,
        scrolling: false,
      };
    });
    listen(canvas, "pointermove", (event) => {
      if (pointer?.id === event.pointerId) {
        const dx = event.clientX - pointer.x,
          dy = event.clientY - pointer.y;
        dragDistance = Math.hypot(dx, dy);
        if (
          pointer.type === "touch" &&
          !pointer.dragging &&
          Math.abs(dy) > Math.abs(dx) + 5
        )
          pointer.scrolling = true;
        if (pointer.scrolling) return;
        if (!pointer.dragging && dragDistance > 5) {
          pointer.dragging = true;
          canvas.setPointerCapture(event.pointerId);
        }
        if (pointer.dragging) {
          const sensitivity =
            100 / Math.min(width, height) / Math.sqrt(view.zoom);
          view.longitude = wrapLongitude(pointer.longitude - dx * sensitivity);
          view.latitude = clamp(pointer.latitude + dy * sensitivity, -80, 80);
          hideTooltip();
          canvas.style.cursor = "grabbing";
          if (event.cancelable) event.preventDefault();
          requestRender();
          return;
        }
      }
      if (
        event.pointerType !== "touch" &&
        performance.now() - lastHoverTime > 35
      ) {
        lastHoverTime = performance.now();
        showTooltip(event);
      }
    });
    function endPointer(event) {
      if (pointer?.id !== event.pointerId) return;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      pointer = null;
      canvas.style.cursor = "grab";
    }
    listen(window, "pointerup", endPointer);
    listen(window, "pointercancel", endPointer);
    listen(canvas, "pointerleave", () => {
      if (!pointer?.dragging) hideTooltip();
    });
    listen(canvas, "click", (event) => {
      if (dragDistance > 5) {
        dragDistance = 0;
        return;
      }
      selectAt(event.clientX, event.clientY);
    });
    listen(canvas, "keydown", (event) => {
      const step = event.shiftKey ? 15 : 7.5;
      const target = tween?.to || view;
      if (event.key === "ArrowLeft")
        animateView({ longitude: target.longitude - step }, 220);
      else if (event.key === "ArrowRight")
        animateView({ longitude: target.longitude + step }, 220);
      else if (event.key === "ArrowUp")
        animateView({ latitude: target.latitude + step }, 220);
      else if (event.key === "ArrowDown")
        animateView({ latitude: target.latitude - step }, 220);
      else if (event.key === "+" || event.key === "=") zoomBy(1.2);
      else if (event.key === "-" || event.key === "_") zoomBy(1 / 1.2);
      else if (event.key === "Home") reset();
      else if (event.key === "Enter" || event.key === " ") {
        const bounds = canvas.getBoundingClientRect();
        selectAt(
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2,
        );
      } else if (event.key === "Escape") {
        hideTooltip();
        tween = null;
      } else return;
      event.preventDefault();
    });
    listen(document, "visibilitychange", () => {
      if (document.hidden) {
        tween = null;
        stopLoop();
        hideTooltip();
      } else requestRender();
    });
    listen(media, "change", (event) => {
      reducedMotion = event.matches;
      if (reducedMotion && tween) {
        view = { ...tween.to };
        tween = null;
        requestRender();
      }
    });
    resize();
    update();
    paintTexture();
    applyView();
    await Promise.race([
      renderer.compileAsync(scene, camera),
      new Promise((_, reject) => {
        initTimer = setTimeout(
          () =>
            reject(
              new Error(
                "The 3D globe took too long to start. Please use the flat map.",
              ),
            ),
          7000,
        );
      }),
    ]);
    clearTimeout(initTimer);
    if (shaderError) throw shaderError;
    if (context.isContextLost() || contextLost)
      throw new Error(
        "The graphics context was lost during globe initialization.",
      );
    renderer.render(scene, camera);
    if (shaderError) throw shaderError;
    canvas.dataset.globeReady = "true";
    container.append(canvas, tooltip);
    ready = true;
    dirty = false;
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    onReady?.();
    return api;
  } catch (error) {
    destroy();
    throw error;
  }
}
