/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const steps = process.env.RSTEPS ? process.env.RSTEPS.split(',') : ['17'];
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
    await page.waitForTimeout(2200);
    await shot('step'+s);
    const t = await page.evaluate(()=>document.body.innerText);
    log('=== STEP '+s+' ===');
    log(t.slice(0, 3500));
  }
};
