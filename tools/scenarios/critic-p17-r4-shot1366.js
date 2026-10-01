/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('a-base');
  await page.keyboard.press('2'); await page.waitForTimeout(1200);
  await shot('b-def2');
  const leg = await page.$('.stage__legend');
  if (leg) { const b = await leg.boundingBox(); log('legend box ' + JSON.stringify(b));
    await page.screenshot({ path: require('path').join(process.env.SHOT_DIR||'/tmp','x.png') }).catch(()=>{}); }
};
