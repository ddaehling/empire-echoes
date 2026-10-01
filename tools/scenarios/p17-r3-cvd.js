/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — the key under protanopia, deuteranopia and tritanopia, plus dark. */
const M = {
  protan: '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
  deutan: '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
  tritan: '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate((MM) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;width:0;height:0');
    svg.innerHTML = Object.entries(MM).map(([k, v]) => `<filter id="cvd-${k}" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${v}"/></filter>`).join('');
    document.body.appendChild(svg);
  }, M);
  // Every swatch has a texture as well as a fill? Report the pairs.
  const pairs = await page.evaluate(() => {
    const out = [];
    for (const r of document.querySelectorAll('.legend__row, .legend__family-head, .legend__chip, .legend__absentlist > li')) {
      const s = r.querySelector('.sym'); if (!s) continue;
      const w = r.querySelector('.legend__word, .legend__family-name, .legend__chip-w, .legend__family-word');
      out.push({ kind: s.dataset.kind || '', tex: s.dataset.tex || 'plain', word: w ? w.textContent.trim() : null });
    }
    return out;
  });
  const noWord = pairs.filter(p => !p.word);
  log('swatch/word/texture rows:', pairs.length, 'without a word:', noWord.length);
  const key = pairs.filter(p => p.kind === 'status');
  const byTex = {};
  for (const p of key) byTex[p.tex] = (byTex[p.tex] || 0) + 1;
  log('status swatch textures:', JSON.stringify(byTex));
  const el = '.stage__legend';
  await shot('01-normal');
  for (const k of Object.keys(M)) {
    await page.evaluate(kk => { document.querySelector('.stage__legend').style.filter = 'url(#cvd-' + kk + ')'; }, k);
    await page.waitForTimeout(250);
    await shot('02-' + k);
  }
  await page.evaluate(() => { document.querySelector('.stage__legend').style.filter = ''; });
  void el;
};
