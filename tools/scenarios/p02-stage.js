/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: page.addStyleTag is not a function.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * HARNESS NOTE (round 4, P02).
 *
 * While this round was being built, the timeline piece was mid-rebuild and
 * rendered 813px tall; the shell's grid then gave the map stage 0px of height,
 * so the plate was 1440 × 0 and nothing about the map could be measured. That
 * is not P02's bug and P02 must not "fix" it by styling another piece's files.
 *
 * `stage()` caps the timeline, IN THE BROWSER ONLY, to the height it had when
 * the round-3 critic ran (354px), so the map gets the stage it is designed for
 * and its own behaviour can be measured. Every scenario that uses it says so.
 * `stage(page, 0)` measures the app exactly as it stands, with no cap.
 */
module.exports = async function stage(page, cap = 354) {
  if (!cap) return false;
  await page.addStyleTag({ content: `.app__time{max-block-size:${cap}px !important;overflow:hidden}` });
  await page.waitForTimeout(1200);
  await page.setViewportSize(page.viewportSize());
  await page.waitForTimeout(1400);
  return true;
};
