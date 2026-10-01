/* shl9-sweep.js — sweep years at apparatus, record any overflow of .app__time. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2300);
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1000);
  const years = [];
  for (let y = 1600; y <= 1997; y += 7) years.push(y);
  const bad = [];
  for (const y of years) {
    await page.evaluate(yy => window.BEA?.bus?.emit?.('ask:setYear', { year: yy }), y);
    await page.waitForTimeout(60);
    const m = await page.evaluate(() => {
      const time = document.querySelector('.app__time'); const box = time.getBoundingClientRect();
      let worst = 0, who = '', h = 0;
      time.querySelectorAll('*').forEach(el => {
        if (!el.getClientRects().length) return;
        const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top);
        if (d > worst) { worst = d; who = (typeof el.className === 'string' ? el.className : el.tagName); h = q.height; }
      });
      const deck = document.querySelector('.tl__deck');
      const kids = [...deck.children].filter(e => e.getClientRects().length);
      const need = kids.reduce((s, e) => s + e.getBoundingClientRect().height, 0) + (kids.length - 1) * 2;
      return { year: document.querySelector('.tl__year')?.textContent, worst: +worst.toFixed(1), who, h: +h.toFixed(1), deckH: +deck.getBoundingClientRect().height.toFixed(1), need: +need.toFixed(1), slack: +(deck.getBoundingClientRect().height - need).toFixed(1) };
    });
    bad.push([y, m]);
  }
  bad.sort((a,b)=>a[1].slack-b[1].slack);
  log('years checked', years.length, 'worstMax', Math.max(...bad.map(b=>b[1].worst)), 'minSlack', Math.min(...bad.map(b=>b[1].slack)));
  bad.slice(0, 25).forEach(([y, m]) => log(String(y), JSON.stringify(m)));
};
