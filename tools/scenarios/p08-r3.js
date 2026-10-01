/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P08 round 3 — the two new surfaces (the 1947 twin, the open range bar) at a
 * viewport, measured for clipping, horizontal overflow and document scroll.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(900);

  const measure = async (label) => {
    const m = await page.evaluate(() => {
      const bad = [];
      const root = document.querySelector('.viz');
      if (root) {
        for (const n of root.querySelectorAll('*')) {
          if (n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0
              && getComputedStyle(n).overflowX !== 'auto' && getComputedStyle(n).overflowX !== 'scroll') {
            bad.push((n.className || n.tagName) + ' ' + n.scrollWidth + '>' + n.clientWidth);
          }
        }
      }
      const map = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
      const mr = map ? map.getBoundingClientRect() : null;
      const body = document.querySelector('.cx-sheet__body');
      return {
        docScroll: document.documentElement.scrollHeight - innerHeight,
        docWide: document.documentElement.scrollWidth - innerWidth,
        clipped: bad.slice(0, 6),
        map: mr ? Math.round(mr.width) + 'x' + Math.round(mr.height) : 'none',
        sheetScrolls: body ? body.scrollHeight > body.clientHeight : null,
        fonts: [...new Set([...(document.querySelector('.viz') || document.body).querySelectorAll('*')]
          .map((n) => getComputedStyle(n).fontSize))].sort(),
      };
    });
    log(label + ' ' + JSON.stringify(m));
    return m;
  };

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'twin' }));
  await page.waitForTimeout(600);
  await shot('twin-ask');
  await measure('TWIN ASK');
  await page.evaluate(() => { const h = document.querySelectorAll('.viz-twin .viz-hundred__handle')[0]; if (h) h.focus(); });
  for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await shot('twin-revealed');
  await measure('TWIN REVEALED');
  await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); if (b) b.scrollTop = b.scrollHeight; });
  await page.waitForTimeout(300);
  await shot('twin-foot');

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:kenya' }));
  await page.waitForTimeout(600);
  await page.evaluate(() => { const c = document.querySelector('.viz-ratio__commit'); if (c) c.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const r = document.querySelector('.viz-range'); if (r) r.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(300);
  await shot('range');
  await measure('RANGE');
};
