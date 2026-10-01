import * as THREE from "../vendor/three.module.js";
import {
  feature,
  merge,
  geoPath,
  geoEquirectangular,
  geoGraticule,
  geoContains,
  geoCentroid,
  geoBounds,
} from "../../vendor/geo.js";

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

// Longitude zero faces +X and 90°E faces −Z in the geographic mesh.
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
 * A demand-rendered geographic sheet built from the atlas's local data.
 * setProjection("flat" | "globe", { animate }) resolves after reset/unfold/fold.
 * Interrupted transitions resolve with { cancelled: true }; the newest wins.
 *
 * createGlobe(container, { data, onSelect, onReady, onFallback }) returns a Promise.
 * A WebGL2/initialization failure rejects it so the caller can show its 2D map.
 * Later context loss calls optional onFallback(error) (or onError) and emits `globeerror`.
 * The caller owns the container's size and the surrounding search/legend UI.
 */
export async function createGlobe(
  container,
  {
    data,
    onSelect = () => {},
    onReady,
    onError,
    onFallback,
    onTransition,
  } = {},
) {
  const styles = getComputedStyle(container);
  const token = (name, fallback) =>
    styles.getPropertyValue(name).trim() || fallback;
  const COLOR = {
    sea: token("--map-ocean", "#e8e4da"),
    land: token("--map-land", "#c6c4b4"),
    border: token("--map-border", "#f5f0e5"),
    extent: token("--map-empire", "#be5b38"),
    empireBorder: token("--map-empire-border", "#713813"),
    home: token("--map-home", "#2f4046"),
    selected: token("--ink", "#242e32"),
    selectedLand: token("--accent-soft", "#ddd3bb"),
    grid: token("--map-grid", "#b9b7a9"),
    direct: token("--map-direct", token("--map-empire", "#be5b38")),
    indirect: token("--map-indirect", "#b08a4c"),
    limited: token("--map-limited", "#738a93"),
    added: token("--map-added", "#2b6b67"),
    removed: token("--map-removed", "#8e453f"),
    changed: token("--map-changed", "#80652d"),
  };
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
  let current = { year: 1920, mode: "extent", selectedId: null, changes: null };
  let states = data.statusAt(current.year);
  let view = { ...INITIAL_VIEW, panX: 0, panY: 0 };
  let projectionMode = "globe",
    targetProjection = "globe",
    morph = 0;
  let projectionTransition = null;
  let colourTween = null,
    colourMix = 1,
    animateNextColour = false;
  let renderedFrames = 0;
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
  let focusCrossesEdge = false;
  let lastHoverTime = 0;
  let initTimer = null,
    shaderError = null;
  let resizeObserver;

  const textureSize = Math.min(4096, renderer.capabilities.maxTextureSize);
  const textureCanvas = document.createElement("canvas");
  const baseCanvas = document.createElement("canvas");
  const previousCanvas = document.createElement("canvas");
  textureCanvas.width = baseCanvas.width = previousCanvas.width = textureSize;
  textureCanvas.height =
    baseCanvas.height =
    previousCanvas.height =
      textureSize / 2;
  const textureContext = textureCanvas.getContext("2d", { alpha: false });
  const baseContext = baseCanvas.getContext("2d", { alpha: false });
  const previousContext = previousCanvas.getContext("2d", { alpha: false });
  if (!textureContext || !baseContext || !previousContext) {
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

  function settleColours() {
    colourTween = null;
    colourMix = 1;
    animateNextColour = false;
    surfaceMaterial.uniforms.colourMix.value = 1;
    dirty = true;
  }

  function paintTexture() {
    if (
      animateNextColour &&
      ready &&
      active &&
      !reducedMotion &&
      !projectionTransition &&
      !document.hidden
    ) {
      // Snapshot the displayed blend before painting the next year. Rapid
      // slider updates continue from the current colour, never an older year.
      previousContext.globalAlpha = colourMix;
      previousContext.drawImage(textureCanvas, 0, 0);
      previousContext.globalAlpha = 1;
      previousTexture.needsUpdate = true;
      colourMix = 0;
      colourTween = { started: performance.now(), duration: 540 };
      surfaceMaterial.uniforms.colourMix.value = 0;
    } else if (animateNextColour) settleColours();
    animateNextColour = false;
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
    const imperialGeometry = merge(
      topology,
      topology.objects.units.geometries.filter(
        (item) =>
          states.get(String(item.id))?.controlled &&
          !HOME_FROM.has(String(item.id)),
      ),
    );
    textureContext.strokeStyle = COLOR.empireBorder;
    textureContext.lineWidth = 2.1;
    textureContext.lineJoin = "round";
    textureContext.stroke(new Path2D(path(imperialGeometry) || ""));
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
    // Comparison outlines describe the chosen year change. They remain still
    // until the next comparison, so losses remain discoverable after the fill
    // disappears and no motion loop competes with classroom discussion.
    for (const [kind, dash] of [
      ["added", []],
      ["removed", [9, 5]],
      ["changed", [2, 4]],
    ]) {
      const ids = new Set(current.focusId ? [] : current.changes?.[kind] || []);
      if (!ids.size) continue;
      const geometry = merge(
        topology,
        topology.objects.units.geometries.filter((item) =>
          ids.has(String(item.id)),
        ),
      );
      const outline = new Path2D(path(geometry) || "");
      textureContext.lineJoin = "round";
      textureContext.setLineDash(dash);
      textureContext.strokeStyle = COLOR.border;
      textureContext.lineWidth = 5.5;
      textureContext.stroke(outline);
      textureContext.strokeStyle = COLOR[kind];
      textureContext.lineWidth = 3;
      textureContext.stroke(outline);
      textureContext.setLineDash([]);
    }
    if (current.focusId) {
      // Fade the actual atlas texture, then repaint the selected geography at
      // full contrast. This works on the very same globe and unfolded sheet.
      textureContext.fillStyle = COLOR.sea;
      textureContext.globalAlpha = 0.68;
      textureContext.fillRect(0, 0, textureSize, textureSize / 2);
      textureContext.globalAlpha = 1;
      for (const unit of units) {
        if (!selectedUnits.has(unit.id)) continue;
        const state = states.get(unit.id);
        const color = state?.controlled ? colorFor(state) : COLOR.selectedLand;
        textureContext.fillStyle =
          state?.controlled && state.partial ? patternFor(color) : color;
        textureContext.fill(unit.path);
      }
    }
    if (selectedGeometry) {
      textureContext.strokeStyle = COLOR.selected;
      textureContext.lineJoin = "round";
      textureContext.lineWidth = current.focusId ? 1 : 3;
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
  const previousTexture = own(new THREE.CanvasTexture(previousCanvas));
  previousTexture.colorSpace = THREE.SRGBColorSpace;
  previousTexture.anisotropy = texture.anisotropy;
  // This is one geographic sheet, not two superimposed maps. At curvature 1
  // it wraps around a sphere; at curvature 0 its seam and poles spread into
  // a north-up rectangular map. UVs stay fixed, so geographic picking remains
  // exactly the same during both projections.
  const longitudeSegments = 128,
    latitudeSegments = 80;
  const vertexCount = (longitudeSegments + 1) * (latitudeSegments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = [];
  for (let row = 0; row <= latitudeSegments; row++) {
    for (let column = 0; column <= longitudeSegments; column++) {
      const vertex = row * (longitudeSegments + 1) + column;
      uvs[vertex * 2] = column / longitudeSegments;
      uvs[vertex * 2 + 1] = 1 - row / latitudeSegments;
      if (row < latitudeSegments && column < longitudeSegments) {
        const below = vertex + longitudeSegments + 1;
        indices.push(vertex, below, vertex + 1, below, below + 1, vertex + 1);
      }
    }
  }
  const sphereGeometry = own(new THREE.BufferGeometry());
  sphereGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  sphereGeometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage),
  );
  sphereGeometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  sphereGeometry.setIndex(indices);

  function surfacePoint(longitude, latitude, amount = morph) {
    const longitudeRadians = longitude * DEG,
      latitudeRadians = latitude * DEG;
    const curvature = 1 - amount;
    if (curvature < 0.00001)
      return new THREE.Vector3(0, latitudeRadians, -longitudeRadians);
    const cosine = Math.cos(curvature * latitudeRadians);
    return new THREE.Vector3(
      (cosine * Math.cos(curvature * longitudeRadians) - 1) / curvature +
        curvature,
      Math.sin(curvature * latitudeRadians) / curvature,
      (-cosine * Math.sin(curvature * longitudeRadians)) / curvature,
    );
  }

  function surfaceNormal(longitude, latitude) {
    return onSphere(longitude * (1 - morph), latitude * (1 - morph));
  }

  function updateGeometry() {
    const curvature = 1 - morph;
    for (let row = 0; row <= latitudeSegments; row++) {
      const latitude = (0.5 - row / latitudeSegments) * Math.PI;
      const sineLatitude = Math.sin(curvature * latitude);
      const cosineLatitude = Math.cos(curvature * latitude);
      for (let column = 0; column <= longitudeSegments; column++) {
        const longitude = (column / longitudeSegments - 0.5) * Math.PI * 2;
        const sineLongitude = Math.sin(curvature * longitude);
        const cosineLongitude = Math.cos(curvature * longitude);
        const i = (row * (longitudeSegments + 1) + column) * 3;
        positions[i] =
          curvature < 0.00001
            ? 0
            : (cosineLatitude * cosineLongitude - 1) / curvature + curvature;
        positions[i + 1] =
          curvature < 0.00001 ? latitude : sineLatitude / curvature;
        positions[i + 2] =
          curvature < 0.00001
            ? -longitude
            : (-cosineLatitude * sineLongitude) / curvature;
        normals[i] = cosineLatitude * cosineLongitude;
        normals[i + 1] = sineLatitude;
        normals[i + 2] = -cosineLatitude * sineLongitude;
      }
    }
    sphereGeometry.attributes.position.needsUpdate = true;
    sphereGeometry.attributes.normal.needsUpdate = true;
    sphereGeometry.computeBoundingSphere();
    surfaceMaterial.uniforms.flatten.value = morph;
    updateMarker();
  }
  const surfaceMaterial = own(
    new THREE.ShaderMaterial({
      uniforms: {
        atlas: { value: texture },
        previousAtlas: { value: previousTexture },
        colourMix: { value: 1 },
        flatten: { value: 0 },
      },
      side: THREE.DoubleSide,
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
      uniform sampler2D previousAtlas;
      uniform float colourMix;
      uniform float flatten;
      varying vec2 atlasUv;
      varying vec3 viewNormal;
      varying vec3 viewPosition;
      void main() {
        vec3 normal = normalize(viewNormal);
        vec3 toViewer = normalize(-viewPosition);
        vec3 keyLight = normalize(vec3(-0.48, 0.65, 1.0));
        float diffuse = max(dot(normal, keyLight), 0.0);
        float sheen = pow(max(dot(reflect(-keyLight, normal), toViewer), 0.0), 42.0) * 0.025;
        vec3 atlasColor = mix(texture2D(previousAtlas, atlasUv).rgb, texture2D(atlas, atlasUv).rgb, colourMix);
        vec3 litColor = mix(atlasColor * (0.67 + 0.36 * diffuse) + vec3(sheen), atlasColor, flatten);
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
      uniforms: {
        rimColor: { value: new THREE.Color(COLOR.sea) },
        opacity: { value: 1 },
      },
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
      uniform float opacity;
      varying vec3 rimNormal;
      varying vec3 rimPosition;
      void main() {
        float edge = 1.0 - abs(dot(normalize(rimNormal), normalize(-rimPosition)));
        float alpha = pow(max(edge, 0.0), 3.0) * 0.28;
        gl_FragColor = vec4(rimColor, alpha * opacity);
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
    const controlledFocus =
      current.focusId &&
      data.territoryAt(current.focusId, current.year)?.controlled;
    markerDot.material.color.set(
      controlledFocus ? COLOR.extent : COLOR.selected,
    );
    markerDot.scale.setScalar(current.focusId ? 2.2 : 1);
    marker.visible = !!selectedPoint;
    if (!selectedPoint) return;
    const normal = surfaceNormal(...selectedPoint);
    marker.position
      .copy(surfacePoint(...selectedPoint))
      .addScaledVector(normal, 0.009);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }

  function flatDistance() {
    return (
      Math.max(
        Math.PI / (2 * Math.tan(18 * DEG)),
        Math.PI / (camera.aspect * Math.tan(18 * DEG)),
      ) * 1.01
    );
  }

  function constrainPan() {
    const distance = flatDistance() / view.zoom;
    const halfHeight = distance * Math.tan(18 * DEG);
    view.panX = clamp(
      view.panX || 0,
      -Math.max(0, Math.PI - halfHeight * camera.aspect),
      Math.max(0, Math.PI - halfHeight * camera.aspect),
    );
    view.panY = clamp(
      view.panY || 0,
      -Math.max(0, Math.PI / 2 - halfHeight),
      Math.max(0, Math.PI / 2 - halfHeight),
    );
  }

  function applyView() {
    const near = current.focusId ? 0.005 : 0.05;
    if (camera.near !== near) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
    constrainPan();
    const distance = Math.max(
      current.focusId ? (morph > 0.99 ? 0.08 : 1.025) : 1.3,
      (baseDistance * (1 - morph) + flatDistance() * morph) / view.zoom,
    );
    const center = new THREE.Vector3(
      0,
      (view.panY || 0) * morph,
      -(view.panX || 0) * morph,
    );
    camera.position
      .copy(
        onSphere(
          view.longitude * (1 - morph),
          view.latitude * (1 - morph),
          distance,
        ),
      )
      .add(center);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    const markerDistance = Math.max(0.025, distance - (1 - morph));
    const markerPixelsPerUnit =
      height / (2 * Math.tan(18 * DEG) * markerDistance);
    marker.scale.setScalar(6.2 / (0.026 * markerPixelsPerUnit));
    atmosphere.visible = morph < 0.94;
    atmosphereMaterial.uniforms.opacity.value = (1 - morph) ** 2;
    canvas.dataset.projection = projectionMode;
    canvas.dataset.targetProjection = targetProjection;
    canvas.dataset.transitionPhase = projectionTransition?.phase || "idle";
    canvas.dataset.morph = morph.toFixed(4);
    canvas.dataset.viewLongitude = view.longitude.toFixed(3);
    canvas.dataset.viewLatitude = view.latitude.toFixed(3);
    canvas.dataset.viewZoom = view.zoom.toFixed(4);
    canvas.dataset.viewPanX = view.panX.toFixed(5);
    canvas.dataset.viewPanY = view.panY.toFixed(5);
    canvas.dataset.focusId = current.focusId || "";
    canvas.dataset.focusTerritory = current.focusId || "";
    canvas.dataset.focusPhase = tween ? "moving" : "settled";
  }

  function pixelPoint(longitude, latitude) {
    const point = surfacePoint(longitude, latitude).project(camera);
    return {
      x: ((point.x + 1) * width) / 2,
      y: ((1 - point.y) * height) / 2,
      depth: point.z,
    };
  }

  function getState() {
    const corners = [
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90],
    ].map(([longitude, latitude]) => pixelPoint(longitude, latitude));
    const xs = corners.map((point) => point.x),
      ys = corners.map((point) => point.y);
    return {
      projection: projectionMode,
      targetProjection,
      phase: projectionTransition?.phase || "idle",
      morph,
      view: { ...view },
      vertexCount,
      renderedFrames,
      colourMix,
      colourTransition: !!colourTween,
      year: current.year,
      focusId: current.focusId || null,
      corners,
      flatBounds: {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      },
      sampleVertices: [
        0,
        longitudeSegments / 2,
        longitudeSegments,
        Math.floor(vertexCount / 2),
        vertexCount - 1,
      ].map((index) => Array.from(positions.slice(index * 3, index * 3 + 3))),
    };
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
    if (projectionTransition) advanceProjection(time);
    if (colourTween) {
      const progress = clamp(
        (time - colourTween.started) / colourTween.duration,
        0,
        1,
      );
      colourMix = progress * progress * (3 - 2 * progress);
      surfaceMaterial.uniforms.colourMix.value = colourMix;
      if (progress === 1) colourTween = null;
      dirty = true;
    }
    if (tween) {
      const progress = clamp((time - tween.started) / tween.duration, 0, 1);
      const eased = 1 - (1 - progress) ** 4;
      for (const key of ["longitude", "latitude", "zoom", "panX", "panY"])
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
      renderedFrames++;
      dirty = false;
    }
    if (!tween && !projectionTransition && !colourTween) stopLoop();
  }

  function animateView(next, duration = 520) {
    if (projectionTransition) return;
    hideTooltip();
    const target = { ...view, ...next };
    target.latitude = clamp(target.latitude, -80, 80);
    target.zoom = clamp(
      target.zoom,
      projectionMode === "flat" ? 1 : 0.8,
      current.focusId
        ? projectionMode === "flat"
          ? 32
          : baseDistance / 1.025
        : projectionMode === "flat"
          ? 4
          : 2.3,
    );
    target.longitude =
      view.longitude + wrapLongitude(target.longitude - view.longitude);
    if (duration === 0 || reducedMotion || !active || document.hidden) {
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

  const smoothstep = (value) =>
    value * value * value * (value * (value * 6 - 15) + 10);

  function finishProjection(cancelled = false) {
    const transition = projectionTransition;
    projectionTransition = null;
    if (!cancelled) {
      projectionMode = targetProjection;
      morph = projectionMode === "flat" ? 1 : 0;
      view = { ...INITIAL_VIEW, panX: 0, panY: 0 };
      updateGeometry();
    }
    canvas.style.cursor = "grab";
    canvas.setAttribute("aria-busy", "false");
    updateLabel();
    onTransition?.(false);
    transition?.resolve({ projection: projectionMode, cancelled });
    requestRender();
  }

  function advanceProjection(time) {
    const transition = projectionTransition;
    if (!transition) return;
    const progress = clamp(
      (time - transition.started) / transition.duration,
      0,
      1,
    );
    const eased = smoothstep(progress);
    if (transition.phase === "reset") {
      for (const key of ["longitude", "latitude", "zoom", "panX", "panY"])
        view[key] =
          transition.fromView[key] +
          (transition.toView[key] - transition.fromView[key]) * eased;
      if (progress === 1) {
        view = { ...INITIAL_VIEW, panX: 0, panY: 0 };
        transition.phase = "unfold";
        transition.started = time;
        transition.duration = 1150;
        transition.fromMorph = 0;
        transition.fromView = { ...view };
      }
    } else {
      morph =
        transition.fromMorph +
        (transition.toMorph - transition.fromMorph) * eased;
      // Undo zoom and pan as the paper settles into its new projection.
      view.zoom =
        transition.fromView.zoom + (1 - transition.fromView.zoom) * eased;
      view.panX = transition.fromView.panX * (1 - eased);
      view.panY = transition.fromView.panY * (1 - eased);
      updateGeometry();
      if (progress === 1) finishProjection();
    }
    dirty = true;
  }

  function setProjection(next, { animate = true } = {}) {
    const target = next === "flat" ? "flat" : "globe";
    if (destroyed || contextLost)
      return Promise.resolve({ projection: projectionMode, cancelled: true });
    if (target === targetProjection && projectionTransition)
      return projectionTransition.promise;
    if (target === projectionMode && !projectionTransition)
      return Promise.resolve({ projection: projectionMode, cancelled: false });
    if (projectionTransition) finishProjection(true);
    targetProjection = target;
    settleColours();
    tween = null;
    pointer = null;
    hideTooltip();
    let resolve;
    const promise = new Promise((done) => {
      resolve = done;
    });
    const toMorph = target === "flat" ? 1 : 0;
    const resetFirst = morph === 0 && target === "flat";
    if (Math.abs(toMorph - morph) < 0.0001 && !resetFirst) {
      projectionMode = targetProjection;
      updateLabel();
      requestRender();
      return Promise.resolve({ projection: projectionMode, cancelled: false });
    }
    const toView = { ...INITIAL_VIEW, panX: 0, panY: 0 };
    toView.longitude =
      view.longitude + wrapLongitude(INITIAL_VIEW.longitude - view.longitude);
    projectionTransition = {
      phase: resetFirst ? "reset" : target === "flat" ? "unfold" : "fold",
      started: performance.now(),
      duration: resetFirst
        ? 440
        : Math.max(300, Math.abs(toMorph - morph) * 1050),
      fromMorph: morph,
      toMorph,
      fromView: { ...view },
      toView,
      resolve,
      promise,
    };
    canvas.setAttribute("aria-busy", "true");
    canvas.style.cursor = "progress";
    onTransition?.(true);
    if (
      !animate ||
      reducedMotion ||
      !active ||
      document.hidden ||
      (Math.abs(toMorph - morph) < 0.0001 && !resetFirst)
    )
      finishProjection();
    requestRender();
    return promise;
  }

  function updateLabel() {
    canvas.setAttribute(
      "aria-roledescription",
      projectionMode === "flat" ? "interactive map" : "interactive globe",
    );
    canvas.setAttribute(
      "aria-label",
      `Interactive ${projectionMode === "flat" ? "flat map" : "globe"} of British authority during ${current.year}. ${current.mode === "rule" ? "Colours distinguish direct, indirect and limited authority." : "The empire colour shows British authority."} Hatched areas show partial control. Boundaries are approximate. Arrow keys ${projectionMode === "flat" ? "pan" : "rotate"}, plus and minus zoom, and Home resets. Place search provides every territory by keyboard.`,
    );
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
    if (candidate.year !== current.year) animateNextColour = true;
    if (candidate.year !== current.year && !Object.hasOwn(next, "changes"))
      candidate.changes = null;
    if (Object.hasOwn(next, "changes")) textureDirty = true;
    if (
      candidate.year !== current.year ||
      candidate.mode !== current.mode ||
      candidate.selectedId !== current.selectedId ||
      candidate.focusId !== current.focusId
    )
      textureDirty = true;
    current = candidate;
    states = data.statusAt(current.year);
    updateLabel();
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
    if (!ready || !active || contextLost || projectionTransition) return null;
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
      const position = surfacePoint(...unit.meta.point);
      const normal = surfaceNormal(...unit.meta.point);
      if (normal.dot(camera.position.clone().sub(position)) < 0) continue;
      const projected = position.project(camera);
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
    if (!pointer?.dragging)
      canvas.style.cursor = projectionTransition ? "progress" : "grab";
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
    if (!destroyed) animateView({ ...INITIAL_VIEW, panX: 0, panY: 0 }, 560);
  }

  function captureView() {
    return { projection: projectionMode, view: { ...view } };
  }

  function restoreView(snapshot) {
    if (!snapshot?.view || destroyed) return;
    if (projectionTransition) finishProjection(true);
    projectionMode = targetProjection = snapshot.projection;
    morph = projectionMode === "flat" ? 1 : 0;
    updateGeometry();
    view = { ...snapshot.view };
    tween = null;
    resize();
    updateLabel();
    requestRender();
  }

  function focusTerritory(id, { spotlight = false, animate = true } = {}) {
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
    resize();
    const bounds = geoBounds(geometry);
    focusCrossesEdge = bounds[0][0] > bounds[1][0];
    const lonSpan = (bounds[1][0] - bounds[0][0] + 360) % 360 || 360;
    const latSpan = bounds[1][1] - bounds[0][1];
    if (projectionMode === "flat") {
      const zoom = spotlight
        ? clamp(
            Math.min(300 / Math.max(1, lonSpan), 135 / Math.max(1, latSpan)),
            1.4,
            32,
          )
        : Math.max(1.8, view.zoom);
      animateView(
        { panX: center[0] * DEG, panY: center[1] * DEG, zoom },
        animate ? 620 : 0,
      );
    } else {
      // Fit angular coverage in the available viewport. Tiny territories keep
      // regional context and a crisp locator instead of magnifying texture pixels.
      const radius = clamp(
        (Math.max(latSpan, lonSpan * Math.cos(center[1] * DEG)) * DEG) / 2,
        0.09,
        1.2,
      );
      const halfFov = Math.atan(
        Math.tan(18 * DEG) * Math.min(1, width / height),
      );
      const distance =
        Math.cos(radius) + Math.sin(radius) / (Math.tan(halfFov) * 0.64);
      const zoom = spotlight
        ? clamp(
            baseDistance / Math.max(1.025, distance),
            1.1,
            baseDistance / 1.025,
          )
        : view.zoom;
      animateView(
        { longitude: center[0], latitude: center[1], zoom },
        animate ? 620 : 0,
      );
    }
    return true;
  }

  function setActive(value) {
    if (destroyed) return;
    active = !!value;
    canvas.tabIndex = active ? 0 : -1;
    canvas.setAttribute("aria-hidden", String(!active));
    if (!active) {
      settleColours();
      if (projectionTransition) finishProjection();
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
    if (projectionTransition) finishProjection(true);
    settleColours();
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
    textureCanvas.width = baseCanvas.width = previousCanvas.width = 1;
    textureCanvas.height = baseCanvas.height = previousCanvas.height = 1;
    partialPatterns.clear();
    fallbackByUnit.clear();
    unitsById.clear();
    pointer = tween = null;
  }

  const api = {
    update,
    zoomBy,
    reset,
    focusTerritory,
    setActive,
    setProjection,
    getState,
    captureView,
    getFocusNote: () =>
      projectionMode === "flat" && focusCrossesEdge
        ? "This territory crosses the flat map’s edge: islands on the other side of 180° appear at the opposite edge. Zoom out to see both sides, or return to the atlas and choose Globe."
        : "",
    restoreView,
    resize,
    destroy,
  };

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
      settleColours();
      if (projectionTransition) finishProjection(true);
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
      if (!active || event.button !== 0 || contextLost || projectionTransition)
        return;
      tween = null;
      dragDistance = 0;
      pointer = {
        id: event.pointerId,
        type: event.pointerType,
        x: event.clientX,
        y: event.clientY,
        longitude: view.longitude,
        latitude: view.latitude,
        panX: view.panX,
        panY: view.panY,
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
          if (projectionMode === "flat") {
            const unitsPerPixel =
              (2 * flatDistance() * Math.tan(18 * DEG)) / view.zoom / height;
            view.panX = pointer.panX - dx * unitsPerPixel;
            view.panY = pointer.panY + dy * unitsPerPixel;
            constrainPan();
          } else {
            view.longitude = wrapLongitude(
              pointer.longitude - dx * sensitivity,
            );
            view.latitude = clamp(pointer.latitude + dy * sensitivity, -80, 80);
          }
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
      if (projectionTransition) {
        if (event.key === "Escape") finishProjection();
        return;
      }
      const step = event.shiftKey ? 15 : 7.5;
      const target = tween?.to || view;
      if (event.key === "ArrowLeft")
        animateView(
          projectionMode === "flat"
            ? { panX: target.panX - step * DEG }
            : { longitude: target.longitude - step },
          220,
        );
      else if (event.key === "ArrowRight")
        animateView(
          projectionMode === "flat"
            ? { panX: target.panX + step * DEG }
            : { longitude: target.longitude + step },
          220,
        );
      else if (event.key === "ArrowUp")
        animateView(
          projectionMode === "flat"
            ? { panY: target.panY + step * DEG }
            : { latitude: target.latitude + step },
          220,
        );
      else if (event.key === "ArrowDown")
        animateView(
          projectionMode === "flat"
            ? { panY: target.panY - step * DEG }
            : { latitude: target.latitude - step },
          220,
        );
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
        settleColours();
        if (projectionTransition) finishProjection();
        tween = null;
        stopLoop();
        hideTooltip();
      } else requestRender();
    });
    listen(media, "change", (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) settleColours();
      if (reducedMotion && projectionTransition) finishProjection();
      if (reducedMotion && tween) {
        view = { ...tween.to };
        tween = null;
        requestRender();
      }
    });
    updateGeometry();
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
