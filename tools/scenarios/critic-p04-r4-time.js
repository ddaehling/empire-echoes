/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const probe = async (label) => {
    const m = await page.evaluate(() => {
      const g = s => { const e=document.querySelector(s); return e? Math.round(e.getBoundingClientRect().height):null; };
      return { doss:g('#dossier'), time:g('.app__time'), stage:g('.app__stage')??g('[style*=stage]'), svg:g('svg') };
    });
    log(label, JSON.stringify(m));
  };
  for (const t of [500,1000,1500,2000,2500,3000,4000,6000]) {
    await page.waitForTimeout(t===500?500:500);
    await probe('t=' + t);
  }
  await shot('after');
};
