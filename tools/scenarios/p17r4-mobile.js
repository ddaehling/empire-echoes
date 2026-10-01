/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const g = async (t) => log(t, JSON.stringify(await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
      return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const mapEl = document.querySelector('.stage__map');
    const covered = ['#legend-byline', '.stage__legend', '#legend-plate'].map(s => {
      const e = document.querySelector(s); if (!e) return 0; const b = e.getBoundingClientRect();
      const m = mapEl.getBoundingClientRect();
      const w = Math.max(0, Math.min(b.right, m.right) - Math.max(b.left, m.left));
      const h = Math.max(0, Math.min(b.bottom, m.bottom) - Math.max(b.top, m.top));
      return Math.round(w * h); }).reduce((a,b)=>a+b,0);
    const m = mapEl.getBoundingClientRect();
    return { map: r('.stage__map'), stage: r('.app__stage'), byline: r('#legend-byline'),
      key: r('.stage__legend'), plate: r('#legend-plate'), time: r('.app__time'),
      mapCoveredPct: m.width*m.height ? Math.round(covered/(m.width*m.height)*100) : null };
  })));
  await g('MOBILE closed');
  await shot('m-closed');
  await page.evaluate(() => { const b = document.querySelector('.legend__open'); if (b) b.click(); });
  await page.waitForTimeout(900);
  await g('MOBILE plate');
  await shot('m-plate');
  await page.evaluate(() => window.BEA.legend.closePlate());
  await page.waitForTimeout(700);
  await g('MOBILE after close');
  await shot('m-closed2');
};
