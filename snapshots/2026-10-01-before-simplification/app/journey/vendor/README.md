# Local Three.js runtime

- **Package:** `three@0.185.1` (r185), the npm `latest` release checked on 7 September 2026.
- **Source:** the published npm package, [three on npm](https://www.npmjs.com/package/three/v/0.185.1), maintained by the [Three.js project](https://github.com/mrdoob/three.js).
- **Archive:** `https://registry.npmjs.org/three/-/three-0.185.1.tgz`; npm integrity `sha512-5aojFCXKwnjBRZvUnt3WFfEcvUJgkN5LlijRFN95hMy8WVkG4I0QNcJE+OuWvuJ0bOdStrbfXn0pkd6/QyiAlg==`.
- **Files:** `build/three.module.js` and its required sibling `build/three.core.js`, copied without modification from the package archive.
- **License:** MIT; the complete upstream license is retained in `three.LICENSE`. The upstream copyright notices are also retained in both modules.
- **Runtime:** local ES module imports only. The globe makes no CDN, asset-service or external texture requests. Its map texture is rendered from the existing local atlas geometry and historical data.

The globe uses the current official APIs for [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [CanvasTexture](https://threejs.org/docs/pages/CanvasTexture.html), and [Raycaster](https://threejs.org/docs/pages/Raycaster.html). It disposes geometry, materials, textures and the renderer following the [Three.js disposal guide](https://threejs.org/manual/en/how-to-dispose-of-objects.html).

To reproduce the vendor copy without changing the project's dependencies:

```sh
mkdir -p /tmp/empire-three-package /tmp/empire-three-cache
npm pack three@0.185.1 --pack-destination /tmp/empire-three-package --cache /tmp/empire-three-cache
tar -xzf /tmp/empire-three-package/three-0.185.1.tgz -C /tmp/empire-three-package
```

Copy the two files from the extracted `package/build/` directory and retain `package/LICENSE` as `three.LICENSE`.
