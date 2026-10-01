/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b4-lines.js — is a LINE OF PROSE ever cut through its x-height at either
 * edge of the beat's reading window? Measured with Range line boxes, not
 * elements: a paragraph straddling the edge is fine, a LINE straddling it is
 * the defect. A line whose visible slice is between 20% and 80% of its height
 * is "sliced": less and it is out of view, more and it is a whole line.
 */
const A = process.env.A || '#tour=core&step=9';
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/' + A, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);

  const probe = () => page.evaluate(() => {
    const sc = document.querySelector('.tr-panel__scroll');
    if (!sc) return null;
    const box = sc.getBoundingClientRect();
    const out = { top: [], bottom: [], scrollTop: Math.round(sc.scrollTop) };
    const walker = document.createTreeWalker(sc, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      if (!t.nodeValue.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(t);
      for (const line of r.getClientRects()) {
        if (line.height < 4) continue;
        const visTop = Math.max(line.top, box.top);
        const visBot = Math.min(line.bottom, box.bottom);
        const vis = (visBot - visTop) / line.height;
        if (vis <= 0.2 || vis >= 0.8) continue;
        const which = line.top < box.top ? 'top' : 'bottom';
        /* A fragment at the foot is not a defect if the mask covers exactly it:
           `--tr-cut` is the measured fragment. */
        const cut = parseFloat(getComputedStyle(sc).getPropertyValue('--tr-cut')) || 0;
        const faded = which === 'bottom' && Math.abs(cut - (visBot - visTop)) < 2;
        out[which].push({ vis: +vis.toFixed(2), faded, cut: +cut.toFixed(1), text: (t.nodeValue || '').trim().slice(0, 44) });
      }
    }
    return out;
  });

  const at = async (y) => {
    await page.evaluate((yy) => { const s = document.querySelector('.tr-panel__scroll'); if (s) s.scrollTop = yy; }, y);
    await page.waitForTimeout(420);
    return probe();
  };

  log('FIRST PAINT ' + JSON.stringify(await probe()));
  const h = await page.evaluate(() => { const s = document.querySelector('.tr-panel__scroll'); return s ? [s.clientHeight, s.scrollHeight] : [0, 0]; });
  log('window ' + h[0] + ' / content ' + h[1]);
  let sliced = 0, tries = 0;
  for (let y = 37; y < h[1] - h[0]; y += 97) {
    const r = await at(y);
    tries++;
    const n = (r.top.length + r.bottom.length);
    if (n) { sliced++; if (sliced <= 6) log('at ' + y + ': ' + JSON.stringify(r)); }
  }
  log('SLICED AT ' + sliced + ' of ' + tries + ' scroll offsets');
  await shot('lines');
};
