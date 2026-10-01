/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'style').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — the key under protanopia, deuteranopia and tritanopia.
   The filters are the standard Machado/Brettel-style matrices applied to the
   whole document, so what is shot is what such a reader sees. */
const M = {
  protanopia: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(800);
  await shot('normal', '#legend-plate');
  await page.evaluate((m) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('style', 'position:fixed;width:0;height:0');
    for (const [k, v] of Object.entries(m)) {
      const f = document.createElementNS(ns, 'filter');
      f.setAttribute('id', 'cvd-' + k);
      f.setAttribute('color-interpolation-filters', 'sRGB');
      const cm = document.createElementNS(ns, 'feColorMatrix');
      cm.setAttribute('type', 'matrix'); cm.setAttribute('values', v);
      f.appendChild(cm); svg.appendChild(f);
    }
    document.body.appendChild(svg);
  }, M);
  for (const k of Object.keys(M)) {
    await page.evaluate((kk) => { document.querySelector('#legend-plate').style.filter = `url(#cvd-${kk})`; }, k);
    await page.waitForTimeout(250);
    await shot(k, '#legend-plate');
  }
  await page.evaluate(() => { document.querySelector('#legend-plate').style.filter = ''; });
  // every swatch must carry a texture or a distinct kind, and a word
  log('SWATCH AUDIT:', JSON.stringify(await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.lplate__col--a .legend__row, .lplate__col--b .legend__row')];
    const bad = [];
    for (const r of rows) {
      const sym = r.querySelector('.sym');
      const word = r.querySelector('.legend__word');
      if (!sym || !word || !word.textContent.trim()) { bad.push(r.innerText.slice(0,40)); continue; }
      const tex = sym.dataset.tex || null;
      const kind = sym.dataset.kind || null;
      if (!tex && kind === 'status') bad.push('no texture: ' + word.textContent);
    }
    const fams = [...document.querySelectorAll('.legend__family-head .sym')].length;
    return { rows: rows.length, fams, bad };
  })));
};
