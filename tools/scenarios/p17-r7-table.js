/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  log(JSON.stringify(await page.evaluate(() => {
    const R = s => { const n = document.querySelector(s); if (!n) return null;
      const b = n.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; };
    const root = document.querySelector('.legend--ribbon');
    const list = root.querySelector('.legend__ribbon-list');
    const lb = list.getBoundingClientRect();
    const ribs = [...list.querySelectorAll('.legend__rib')];
    const shown = ribs.filter(n => !n.hidden);
    const named = shown.filter(n => { const w = n.querySelector('.legend__rib-w');
      return w && w.getBoundingClientRect().width > 1; });
    return { vw: innerWidth, vh: innerHeight,
      keySlot: R('.stage__key'), ribbon: R('.legend--ribbon'),
      listAvail: Math.round(list.clientWidth), listUsed: Math.round(list.scrollWidth),
      sentence: (document.querySelector('.legend__say') || {}).textContent || null,
      route: (root.querySelector('.legend__route') || {}).textContent || null,
      total: ribs.length, shown: shown.length, named: named.length,
      tier: root.dataset.tier, halfDrawn: shown.filter(n => n.getBoundingClientRect().right > lb.right + 0.5).length,
      legendControls: root.querySelectorAll('button,a[href]').length,
      legendWords: root.innerText.trim().split(/\s+/).filter(Boolean).length };
  })));
};
