# Fullscreen scrubbing stability

Fixed 2 October 2026 in `app/journey/css/fullscreen.css`.

The desktop fullscreen world column gave the globe all space left after the legend, timeline and map-change panel. Conditional disclosure visibility, wrapping summaries and expanded change lists altered the panel’s height. This moved the slider and triggered the globe’s ResizeObserver, changing its camera and WebGL drawing buffer during a scrub.

The changes panel now has a stable, viewport-relative allocation and scrolls internally in desktop fullscreen. Opening it or changing its text cannot consume the globe’s space. The outer fullscreen container reserves a scrollbar gutter to prevent width shifts. Compact/short layouts retain their existing fixed globe height and single page scroller; print returns to natural flow.

## Reproduction and regression

Before the fix, native Chromium at 1440 × 1000 changed the scene height from 546.328px to 511.156px when mapped changes appeared, then to 526.641px for a quiet interval. The drawing buffer changed with it. The viewport fallback at 1440 × 900 reproduced the same 35px jump. The new regression failed for both desktop modes before the CSS change.

After the fix, the scene, canvas, drawing buffer and slider track remain stable throughout sampled animation frames and ResizeObserver notifications. The test covers quiet years, changed years, differently wrapped text, disclosure opening/closing, all named changes and real pointer scrubbing. Expanded content remains reachable by keyboard scrolling and the final named change is hit-testable.

`tools/journey-fullscreen-test.js` passes 72 checks across Chromium 151, Firefox 155 and WebKit 26.5: 24 per engine. These include native fullscreen, denied/missing API fallback, entry/exit, focus restoration, route changes, projection changes and the new four stability scenarios (desktop native, desktop fallback, mobile and short landscape). Both normal and reduced motion are exercised. Desktop and mobile screenshots were inspected.

Run `npm run test:journey:fullscreen`, or `FULLSCREEN_STABILITY_ONLY=1 npm run test:journey:fullscreen` for the focused cases. Select engines with `BROWSERS=chromium,firefox,webkit`; this machine’s installed Firefox/WebKit builds require the existing `PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH` and `PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH` overrides.

The static build and deployment checks preserve all 314 frozen snapshot files. The classroom server and student browser storage are not touched by the isolated browser tests.
