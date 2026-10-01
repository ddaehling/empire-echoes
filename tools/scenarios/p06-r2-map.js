/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const m = async (label) => log(label, JSON.stringify(await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return { map: g('[data-mount=map]') || g('#map') || g('.map'), dossier: g('[data-mount=dossier]') || g('#dossier'), timeline: g('[data-mount=timeline]') || g('#timeline'), vp: { w: innerWidth, h: innerHeight } };
  })));
  await m('cold  ');
  await page.evaluate(() => { window.BEA.store.act.setYear(1700); window.BEA.store.act.select('ruperts-land'); });
  await page.waitForTimeout(800);
  await m('dossier');
};
