/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** Acceptance test 1: coastline in both themes, no #000 / #fff fill anywhere. */
module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#year=1913');
  await page.waitForTimeout(3400);
  for (const theme of ['paper', 'lamplit']) {
    await page.evaluate((t) => window.BEA.store.dispatch('setTheme', t), theme);
    await page.waitForTimeout(1100);
    const r = await page.evaluate(() => {
      const m = window.__map, T = m.plate.tokens;
      const c = document.querySelector('.map__plate');
      const g = c.getContext('2d');
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let black = 0, white = 0, n = 0;
      const hist = new Map();
      for (let i = 0; i < d.length; i += 4 * 7) {
        n++;
        const R = d[i], G = d[i + 1], B = d[i + 2];
        if (R < 8 && G < 8 && B < 8) black++;
        if (R > 250 && G > 250 && B > 250) white++;
        const k = (R >> 3) + ',' + (G >> 3) + ',' + (B >> 3);
        hist.set(k, (hist.get(k) || 0) + 1);
      }
      // is the coast colour actually on the canvas?
      const hex = (s) => { const v = s.replace('#', ''); return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]; };
      const coast = hex(T.coast);
      let coastish = 0;
      for (let i = 0; i < d.length; i += 4 * 3) {
        if (Math.abs(d[i] - coast[0]) + Math.abs(d[i + 1] - coast[1]) + Math.abs(d[i + 2] - coast[2]) < 46) coastish++;
      }
      const badFills = Object.entries(T.fills).filter(([k, v]) => /^#?(000000|ffffff|000|fff)$/i.test(String(v).replace('#', '')));
      return { theme: document.documentElement.dataset.theme, coast: T.coast, sea: T.sea,
        pctBlack: +(100 * black / n).toFixed(3), pctWhite: +(100 * white / n).toFixed(3),
        coastPixels: coastish, badFills: badFills.map((b) => b.join('=')),
        painted: m.plate.paint.size };
    });
    log('THEME', theme, JSON.stringify(r));
    await shot('theme-' + theme);
  }
};
