/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** shellr3-neg — negative control: put the OLD dock arithmetic back and confirm
 *  the round-3 defect reappears, so rule Q3 is known to be able to fail. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  const measure = () => page.evaluate(() => {
    const B = (e) => { if (!e) return null; const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return null;
      const r = e.getBoundingClientRect(); if (r.width < 2) return null;
      return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const ov = (a, b) => (!a || !b) ? 0 : Math.round(Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t)));
    const d = B(document.querySelector('.tr-dock'));
    return { dock: d, sw: ov(d, B(document.querySelector('.map__switch'))), defs: ov(d, B(document.querySelector('.map__defs'))) };
  });
  log('WITH --dock-floor    ' + JSON.stringify(await measure()));
  await page.addStyleTag({ content: `#app .tr-dock[data-on='yes'][data-live='yes'] {
    bottom: calc(max(var(--rail-clear, 0px), calc(var(--time-h) + var(--foot-h))) + var(--key-h) + var(--space-2xs) + var(--tr-dock-lift, 0px)) !important;
    margin-block-end: 0 !important; }` });
  await page.waitForTimeout(600);
  log('WITHOUT (round-2 rule) ' + JSON.stringify(await measure()));
};
