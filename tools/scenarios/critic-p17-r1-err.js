/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[];
  page.on('pageerror', e=>errs.push(e.stack||String(e)));
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  for (const y of [1200,1500,3000]) { await page.evaluate(yy=>{location.hash='#year='+yy;}, y); await page.waitForTimeout(900); }
  log('ERRORS:\n'+errs.join('\n----\n').slice(0,3000));
};
