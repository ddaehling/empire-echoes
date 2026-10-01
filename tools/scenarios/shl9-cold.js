/* shl9-cold.js — cold-load each disclosure level and measure furniture + overflow. */
module.exports = async ({ page, log, shot }) => {
  const base = page.url().split('#')[0];
  const hashes = ['', '#filter=stage:working', '#filter=stage:apparatus', '#year=1857&filter=stage:apparatus'];
  const rows = [];
  for (const h of hashes) {
    await page.goto(base + h, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    await page.evaluate(() => { document.querySelectorAll('.tl-btn--play[data-playing="true"]').forEach(b => b.click()); });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
      const time = document.querySelector('.app__time'); const box = time.getBoundingClientRect();
      const over = [];
      time.querySelectorAll('*').forEach(el => {
        if (!el.getClientRects().length) return;
        const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top, q.right - box.right, box.left - q.left);
        if (d > 0.5) over.push([(typeof el.className === 'string' ? el.className.trim().split(/\s+/).join('.') : el.tagName), +d.toFixed(1), +q.y.toFixed(1), +q.height.toFixed(1), (el.textContent||'').trim().slice(0,22)]);
      });
      over.sort((a, b) => b[1] - a[1]);
      return { stage: document.documentElement.dataset.stage, time: [+box.y.toFixed(1), +box.height.toFixed(1)],
        axis: r('.tl-ax__axis'), spine: r('.tl-spine'), deckH: r('.tl__deck'), now: r('.tl__now'), eng: r('.tl-btn--eng'), key: r('.tl__key'), more: r('.tl__more'), over: over.slice(0,10) };
    });
    log((h || '(cold)').padEnd(34), JSON.stringify(m));
    rows.push([h, m]);
    await shot('lvl' + (h ? h.replace(/[^\w]/g, '_') : 'cold'));
  }
  const a = rows[0][1];
  for (const [h, m] of rows.slice(1)) log('DELTA ' + (h || 'cold').padEnd(30), 'axis', +(m.axis[1] - a.axis[1]).toFixed(1), 'spine', +(m.spine[1] - a.spine[1]).toFixed(1));
};
