/* shl9-states.js — walk many app states, record axis/spine y and time-band overflow. */
module.exports = async ({ page, log, shot }) => {
  const M = async label => {
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.y.toFixed(1), +b.height.toFixed(1)]; };
      const time = document.querySelector('.app__time'); if (!time) return { none: 1 };
      const box = time.getBoundingClientRect();
      let worst = 0, who = '';
      time.querySelectorAll('*').forEach(el => { if (!el.getClientRects().length) return; const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top); if (d > worst) { worst = d; who = (typeof el.className === 'string' ? el.className : el.tagName); } });
      return { stage: document.documentElement.dataset.stage, band: document.getElementById('app')?.dataset.timeband || '-',
        year: document.querySelector('.tl__year')?.textContent,
        time: r('.app__time'), axis: r('.tl-ax__axis'), spine: r('.tl-spine'), deck: r('.tl__deck'),
        over: +worst.toFixed(1), who };
    });
    log(label.padEnd(26), JSON.stringify(m));
    return m;
  };
  await page.waitForTimeout(2300);
  await M('cold');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:setYear', { year: 1670 }));
  await page.waitForTimeout(500); await M('year 1670 plate');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'working' }));
  await page.waitForTimeout(600); await M('working 1670');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(800); await M('apparatus 1670');
  await shot('apparatus-1670');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:setYear', { year: 1900 }));
  await page.waitForTimeout(400); await M('apparatus 1900');
  const eng = await page.$('.tl-btn--eng'); if (eng) await eng.click().catch(() => {});
  await page.waitForTimeout(1000); await M('engines open');
  await shot('engines');
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); await M('engines closed');
  // tours
  const routes = await page.evaluate(() => Object.keys(window.BEA?.toursRoutes || {}));
  log('routes', JSON.stringify(routes));
};
