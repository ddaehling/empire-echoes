/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const stacks = [];
  page.on('pageerror', e => stacks.push(String(e.stack||e).slice(0,900)));
  await page.waitForTimeout(3000);
  await page.evaluate(async () => {
    const store = window.BEA.store;
    for (let i=0;i<200;i++){ store.dispatch('setYear', 1400 + i*3); await new Promise(r=>requestAnimationFrame(r)); }
  });
  await page.waitForTimeout(600);
  log('errors captured:', stacks.length);
  log('first stack:\n' + (stacks[0]||'none'));
  log('second stack:\n' + (stacks[1]||'none'));
};
