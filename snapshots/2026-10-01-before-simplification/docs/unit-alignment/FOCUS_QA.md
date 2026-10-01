# Territory focus acceptance audit

Owner: independent atlas focus QA. Scope: `app/journey` territory focus, with the implementation owned by the atlas focus agent. No application files are edited by this audit.

## Requirement and initial finding

Opening a territory story must enlarge and highlight the chosen place on the existing global atlas, retain the current globe or flat projection, and fade the rest of the application. A newly drawn local territory SVG is not equivalent.

The initial implementation failed that requirement: `main.js` hid `#explore-view` and deactivated the globe for the territory route; `territory.js` constructed a separate `.tp-map-svg` using a local azimuthal projection. The story and image content were present, but the atlas canvas did not supply the dedicated page's map.

## Acceptance evidence required

| Area                 | Required evidence                                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing map         | Save a reference to the original atlas canvas (or fallback SVG); opening and closing the story must use the same connected node, with no replacement territory SVG.                                                                                                                 |
| Real focus           | Compare renderer camera/zoom or SVG world transform before and after; save and visually inspect live screenshots. The selected place must visibly occupy more map area and retain a distinct highlight while surrounding geography fades. A class or dataset alone is insufficient. |
| Projection           | Globe opens as globe; unfolded flat map opens as flat. The active projection survives close, reopen, and cold deep links.                                                                                                                                                           |
| Background           | The surrounding application is visibly faded, inert while focused, and restored after close. The focused map and reading content remain legible.                                                                                                                                    |
| Stories and pictures | Existing territory story text and credited photograph load in the reading area. Long-tail territories still have usable dated evidence.                                                                                                                                             |
| Navigation           | Keyboard opening, Escape, close/back control, browser Back/Forward, reopen, and valid direct territory links work without duplicate maps or leaked state.                                                                                                                           |
| Restore              | Prior atlas year, selected place, projection, colour mode, camera and scroll/focus return appropriately; all inert flags and focus effects are released.                                                                                                                            |
| Fullscreen           | Opening a territory from native or simulated fullscreen exits it cleanly before focus; focus closes and fullscreen remains usable afterward.                                                                                                                                        |
| Rallye               | A saved response survives a rallye → territory → return round trip. Existing answers are never cleared by focus navigation.                                                                                                                                                         |
| Keyboard             | Focus enters the dialog, stays within available controls, Escape exits, and focus returns to a sensible initiating control. The map remains accessible with a useful name.                                                                                                          |
| Reduced motion       | The final focus appears promptly without prolonged camera travel or running decorative animation.                                                                                                                                                                                   |
| Small screen         | At 390px and 320px, map and reading remain available without horizontal overflow; the close control remains reachable.                                                                                                                                                              |
| WebGL fallback       | Forced WebGL failure uses the existing global fallback SVG, zooms its selected geography, preserves its projection, and restores on exit.                                                                                                                                           |
| Stability            | No browser errors, missing local photos, stale fullscreen locks, duplicate canvases, or broken return routes during tested journeys.                                                                                                                                                |

## Test isolation

The dedicated `tools/journey-focus-test.js` must serve the project on an ephemeral private port and use fresh Playwright browser contexts. It must neither connect to nor stop the classroom server on port 8777, and must not read or write a real student's browser storage. Artifacts go to `/tmp/empire-focus-qa` unless an explicit QA artifact directory is supplied.

## Final verification

Verified on 1 October 2026 with Chromium 151.0.7922.34, including its real Three.js canvas rendered with SwiftShader. Run:

```sh
node tools/journey-focus-test.js
```

**13 scenarios passed; 0 failed.** The final recorded run, after the date-line caption, fallback, viewport-resize and runtime context-loss changes, served the project at an ephemeral loopback port (53255), used new isolated contexts, and left port 8777 untouched. Evidence is saved in `/tmp/empire-focus-qa/results.json` and adjacent PNGs. Both syntax checking and the complete integration run succeeded.

| Scenario                                                                                                                 | Result                                |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Existing globe canvas: Enter → story → Escape, close, reopen, Back/Forward, connected territory and back to atlas        | Pass                                  |
| Existing unfolded canvas: same complete route sequence with flat projection retained                                     | Pass                                  |
| 390px mobile layout, story photograph, reachable close and 844 × 390 landscape resize                                    | Pass                                  |
| 320px mobile layout, story photograph, and no page overflow                                                              | Pass                                  |
| Genuine cold territory deep links in globe and flat modes, plus Jamaica photograph                                       | Pass                                  |
| Forced WebGL failure: same global SVG node, real world transform and restore, plus focused Fiji and map-edge explanation | Pass                                  |
| Native fullscreen → focus → close → fullscreen again                                                                     | Pass                                  |
| Forced viewport fullscreen fallback → focus → close → fullscreen again                                                   | Pass                                  |
| Saved rallye response, notebook and learner details survive territory return                                             | Pass                                  |
| Animated focus settles; reduced motion completes promptly without running decorative animations                          | Pass                                  |
| Custom camera pan and zoom, selected place, year and authority colour mode restore                                       | Pass                                  |
| Hong Kong, Gibraltar and Fiji remain visibly located in globe and flat modes                                             | Pass, with date-line limitation below |
| WebGL context lost while territory focus is open: recovery to SVG, then valid restored flat camera and return route      | Pass                                  |

### Measured rendering evidence

The original connected `#scene-stage` and its original canvas/SVG remain the same objects throughout ordinary opening and closing. The dedicated story no longer creates `.tp-map-svg`. When WebGL is explicitly lost during focus, the same stage recovers to the application's normal global SVG fallback; that fallback then remains the same node on close and restores `translate(0 0) scale(1)` without invalid numeric values.

For British India in 1930, actual renderer zoom changed from **1.0000 to 1.2560** on the globe, **1.0000 to 4.4625** on the unfolded canvas, and **1.0000 to 4.4940** on the WebGL fallback SVG. Each restored to 1.0000. The fallback transform changed from `translate(0 0) scale(1)` to a translated, scaled world and restored exactly. The custom flat camera restored both zoom **1.6900** and horizontal pan **0.13090**, together with its year and authority colours.

Screenshot pixels, rather than CSS declarations alone, establish the visual effect: the unchanged strip of surrounding page reduced mean luminance from **245.93 to 77.68**. The selected India geography occupied about **5.1%** of the focused globe frame and **5.0%** of the focused flat frame in its strong authority colour; surrounding geography remained faded. In the fallback SVG, **256 units were faded and 46 retained full opacity**, with the selected territory clearly visible in the live frame.

### Independent visual review

The following live captures were opened and inspected, not merely generated:

- `baseline-territory.png`: confirms the former independent regional SVG and unfaded page header.
- `globe-focused.png`, `flat-focused.png`, `fallback-focused.png`: original map surface visibly enlarges and highlights India while the page and other geography fade.
- `globe-story-photo.png`: the photograph, caption and credit disclosure remain available beside the live map.
- `mobile-390-focused.png`, `mobile-320-focused.png`, `mobile-landscape-focused.png`: map, reading and close control remain usable in portrait and landscape layouts.
- `globe-gibraltar.png`, `globe-hong-kong.png`, `flat-hong-kong.png`: a crisp locator appears within recognizable surrounding geography; small territories are not falsely enlarged into invented land.
- `globe-fiji.png`, `flat-fiji.png`, `fallback-fiji.png`: Fiji remains highlighted, with the fixed flat-map seam limitation explained in the visible caption.
- `context-loss-focused.png`: graphics-context loss recovers to the global fallback map while the story and dimmed application remain intact.

The audit found and the implementation agent corrected three concrete defects before the passing run: flat-entry links could use a stale globe projection; restored keyboard focus could target the document body after its initiating link was re-rendered; and very small territories could be over-zoomed into unreadable texture pixels. The final minimum regional globe view and small-place locator resolve the third defect without creating a second map.

### Practical limits

The global flat projection retains its fixed antimeridian seam. Fiji therefore appears near its right edge and an eastern island is split/clipped at that edge; the globe provides the continuous centered view. The final focus caption accurately explains that islands beyond 180° appear at the opposite edge and offers zooming out (or returning to the atlas and choosing Globe in the WebGL version). The SVG fallback focuses the main island group in its regional setting and carries the same map-edge explanation. The suite confirms a visible selected location, not that every date-line-spanning island fits on one side of a fixed world sheet. This is a remaining projection limitation, not a replacement-map defect.

Coverage is Chromium with representative desktop/mobile viewports, forced WebGL failure, native fullscreen and a forced viewport fallback. This audit does not claim physical-device, Safari or Firefox validation, comprehensive WCAG conformance, or an accuracy audit of every historical boundary.
