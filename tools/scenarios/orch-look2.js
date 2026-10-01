/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(4500);
  await shot('a-landing');
  const m = await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
    return { vw: innerWidth, vh: innerHeight, stage: r('.app__stage'), map: r('.stage__map'), time: r('.app__time'), dossier: r('.app__dossier'), legend: r('.stage__legend') };
  });
  log('geometry:', JSON.stringify(m));
  await page.evaluate(() => { location.hash = '#year=1783'; });
  await page.waitForTimeout(2000); await shot('b-1783');
};
