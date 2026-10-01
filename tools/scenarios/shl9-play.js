/* shl9-play.js — play, stop, then walk the disclosure levels. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2300);
  const M = async label => {
    const m = await page.evaluate(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
      const time = document.querySelector('.app__time'); const box = time.getBoundingClientRect();
      const over = [];
      time.querySelectorAll('*').forEach(el => {
        if (!el.getClientRects().length) return;
        const q = el.getBoundingClientRect();
        const d = Math.max(q.bottom - box.bottom, box.top - q.top, q.right - box.right, box.left - q.left);
        if (d > 0.5) over.push([(typeof el.className === 'string' ? el.className.trim().split(/\s+/).join('.') : el.tagName), +d.toFixed(1), +q.y.toFixed(1), +q.height.toFixed(1), (el.textContent||'').trim().slice(0,20)]);
      });
      over.sort((a, b) => b[1] - a[1]);
      return { stage: document.documentElement.dataset.stage, year: (document.querySelector('.tl__year')||{}).textContent,
        axis: r('.tl-ax__axis'), spine: r('.tl-spine'), track: r('.tl-spine__track'), trace: r('.tl-spine__trace'),
        deck: r('.tl__deck'), now: r('.tl__now'), eng: r('.tl-btn--eng'), key: r('.tl__key'), more: r('.tl__more'),
        warn: r('.tl__warn'), ends: r('.tl__ends'), over: over.slice(0,10) };
    });
    log(label, JSON.stringify(m));
    return m;
  };
  const a = await M('0 cold      ');
  await page.click('.tl-btn--play').catch(e => log('play click failed', e.message));
  await page.waitForTimeout(3500);
  await page.click('.tl-btn--play').catch(() => {});
  await page.waitForTimeout(700);
  const b = await M('1 afterplay ');
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1200);
  const c = await M('2 apparatus ');
  await shot('after-play-apparatus');
  await shot('time-band', '.app__time');
  log('DELTA cold->afterplay axis', +(b.axis[1]-a.axis[1]).toFixed(1), 'spine', +(b.spine[1]-a.spine[1]).toFixed(1));
  log('DELTA cold->apparatus axis', +(c.axis[1]-a.axis[1]).toFixed(1), 'spine', +(c.spine[1]-a.spine[1]).toFixed(1));
};
