/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  const b = await page.$('.byline__crit');
  if (b) { await b.click(); await page.waitForTimeout(1800); }
  await shot('crit-open');
  const t = await page.evaluate(()=>document.body.innerText);
  const i = t.search(/three things wrong|What this rendering|wrong with this/i);
  log('FULL TEXT around criticism:\n' + t.slice(Math.max(0,i-200), i+3500));
};
