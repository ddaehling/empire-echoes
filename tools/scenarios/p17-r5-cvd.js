/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Simulate the three dichromacies over the running app and shoot the legend +
   the plate's colour column, so every entry can be checked for colour, texture
   and word. Machado-Oliveira 2009 matrices. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => {
    const M = {
      protanopia: '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
      deuteranopia: '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
      tritanopia: '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
    };
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('style', 'position:fixed;width:0;height:0');
    for (const [k, v] of Object.entries(M)) {
      const f = document.createElementNS(ns, 'filter'); f.id = 'cvd-' + k;
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const m = document.createElementNS(ns, 'feColorMatrix');
      m.setAttribute('type', 'matrix'); m.setAttribute('values', v);
      f.appendChild(m); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    window.__cvd = (k) => { document.documentElement.style.filter = k ? `url(#cvd-${k})` : ''; };
  });
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(800);
  for (const k of ['', 'protanopia', 'deuteranopia', 'tritanopia']) {
    await page.evaluate((kk) => window.__cvd(kk), k);
    await page.waitForTimeout(300);
    await shot(k || 'normal');
  }
  await page.evaluate(() => window.__cvd(''));
  log('done');
};
