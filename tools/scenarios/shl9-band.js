/* shl9-band.js — wave 9 shell regressions (a) time-band clipping and
 * (b) axis/spine movement between disclosure levels.
 * Measures, prints, screenshots. Read-only. */
module.exports = async ({ page, shot, log }) => {
  const stop = () => page.evaluate(() => {
    try { window.BEA?.bus?.emit?.('ask:pause'); } catch (e) {}
    document.querySelectorAll('.tl-btn--play[data-playing="true"]').forEach(b => b.click());
  });

  const measure = () => page.evaluate(() => {
    const r = el => { const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), b: +b.bottom.toFixed(1), rr: +b.right.toFixed(1) }; };
    const time = document.querySelector('.app__time');
    if (!time) return { err: 'no .app__time' };
    const box = r(time);
    const over = [];
    time.querySelectorAll('*').forEach(el => {
      if (!el.getClientRects().length) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') return;
      const q = r(el);
      const dBottom = +(q.b - box.b).toFixed(1);
      const dTop = +(box.y - q.y).toFixed(1);
      const dRight = +(q.rr - box.rr).toFixed(1);
      const dLeft = +(box.x - q.x).toFixed(1);
      const worst = Math.max(dBottom, dTop, dRight, dLeft);
      if (worst > 0.5) over.push({ sel: el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName, tag: el.tagName, rect: q, dBottom, dTop, dRight, dLeft, text: (el.textContent || '').trim().slice(0, 40) });
    });
    over.sort((a, b) => Math.max(b.dBottom, b.dTop, b.dRight, b.dLeft) - Math.max(a.dBottom, a.dTop, a.dRight, a.dLeft));
    const pick = s => { const e = document.querySelector(s); return e ? r(e) : null; };
    return {
      stage: document.documentElement.dataset.stage,
      box,
      tl: pick('.tl'), deck: pick('.tl__deck'), body: pick('.tl__body'),
      axis: pick('.tl-ax__axis'), ax: pick('.tl-ax'),
      spine: pick('.tl-spine'), eng: pick('.tl-btn--eng'), now: pick('.tl__now'),
      over: over.slice(0, 14),
    };
  });

  await page.waitForTimeout(2200);
  await stop();
  await page.waitForTimeout(400);
  const plate = await measure();
  log('PLATE', JSON.stringify(plate, null, 1));
  await shot('plate');

  // to working: nudge the year
  await page.evaluate(() => { try { window.BEA?.bus?.emit?.('ask:stage', { level: 'working' }); } catch (e) {} });
  await page.waitForTimeout(700); await stop(); await page.waitForTimeout(400);
  const working = await measure();
  log('WORKING', JSON.stringify(working, null, 1));
  await shot('working');

  await page.evaluate(() => { try { window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }); } catch (e) {} });
  await page.waitForTimeout(900); await stop(); await page.waitForTimeout(500);
  const app = await measure();
  log('APPARATUS', JSON.stringify(app, null, 1));
  await shot('apparatus');
  await shot('apparatus-time', '.app__time');

  const d = (a, b, k) => (a && b && a[k] && b[k]) ? +(b[k].y - a[k].y).toFixed(1) : 'n/a';
  log('MOVE axis plate->apparatus:', d(plate, app, 'axis'), ' spine:', d(plate, app, 'spine'));
  log('MOVE axis plate->working:', d(plate, working, 'axis'), ' spine:', d(plate, working, 'spine'));
};
