/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('direct-load');
  const m = await page.evaluate(() => {
    const g = s => { const e=document.querySelector(s); return e? e.getBoundingClientRect().toJSON():null; };
    return { app:g('.app'), map:g('.app__map'), doss:g('#dossier'), time:g('.app__time'),
      docH: document.documentElement.scrollHeight, winH: innerHeight,
      gridTpl: getComputedStyle(document.querySelector('.app')).gridTemplateAreas };
  });
  log('metrics:', JSON.stringify(m,null,1));
};
