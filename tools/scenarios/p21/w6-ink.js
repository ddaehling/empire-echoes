/** p21/w6-ink.js — contrast of every text colour the Close prints. */
const L = (hex) => {
  const c = hex.replace('#', '');
  const v = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  const rows = await page.evaluate(() => {
    const sel = ['.cl-close__stand', '.cl-close__standnote', '.cl-line[data-can="yes"] .cl-line__text',
      '.cl-line[data-can="no"] .cl-line__text', '.cl-line__missing', '.cl-line__lab', '.cl-door__l',
      '.cl-door__b', '.cl-offmap__price', '.cl-block__row', '.cl-remaining__names', '.cl-sign__scaffold',
      '.cl-say', '.cl-say__lead', '.cl-blk__say'];
    const bg = (n) => { let p = n; while (p) { const c = getComputedStyle(p).backgroundColor; if (c && !/rgba?\(0, 0, 0, 0\)/.test(c)) return c; p = p.parentElement; } return 'rgb(255,255,255)'; };
    const hex = (rgb) => { const m = rgb.match(/\d+/g); return m ? '#' + m.slice(0, 3).map((x) => (+x).toString(16).padStart(2, '0')).join('') : null; };
    return sel.map((s) => { const n = document.querySelector(s); if (!n) return { s, miss: true };
      const cs = getComputedStyle(n);
      return { s, fg: hex(cs.color), bg: hex(bg(n)), size: cs.fontSize, weight: cs.fontWeight }; });
  });
  for (const r of rows) {
    if (r.miss) { log(r.s + ' — not on screen'); continue; }
    const a = L(r.fg), b = L(r.bg);
    const ratio = ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
    const px = parseFloat(r.size);
    const large = px >= 24 || (px >= 18.66 && +r.weight >= 700);
    const need = large ? 3 : 4.5;
    log((ratio >= need ? 'PASS ' : 'FAIL ') + r.s + '  ' + ratio.toFixed(2) + ':1  ' + r.fg + ' on ' + r.bg + '  ' + r.size + '  (needs ' + need + ')');
  }
};
