/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const y of [1780, 1900, 2020]) {
    await page.goto('http://localhost:8777/app/#year='+y,{waitUntil:'load'});
    await page.waitForTimeout(2500);
    const labs = await page.evaluate(()=>[...document.querySelectorAll('svg text')].map(t=>t.textContent.trim()).filter(Boolean));
    log('Y'+y+' n='+labs.length+' :: '+JSON.stringify(labs.filter(l=>/Georgia|Cape|South Africa|Rhodes|Ceylon|Burma|Persia/i.test(l))));
    log('  ALL: '+JSON.stringify(labs).slice(0,1600));
  }
  // and end-of-lesson state
  await page.goto('http://localhost:8777/app/#tour=thirty&step=24&year=2020',{waitUntil:'load'});
  await page.waitForTimeout(2500);
  const l2 = await page.evaluate(()=>[...document.querySelectorAll('svg text')].map(t=>t.textContent.trim()).filter(Boolean));
  log('LESSON2020 :: '+JSON.stringify(l2.filter(l=>/Georgia/i.test(l))));
};
