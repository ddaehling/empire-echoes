const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.goto('http://localhost:8777/app/#tour=lesson-one&step=5');
  await R.ready(page); await page.waitForTimeout(1600);
  const probe = () => window.__p = (() => {
    const hit = (n) => { const b=n.getBoundingClientRect(); const cx=b.left+b.width/2, cy=b.top+b.height/2;
      if (cx<0||cy<0||cx>innerWidth||cy>innerHeight) return 'offscreen@'+Math.round(b.top);
      const t=document.elementFromPoint(cx,cy); return (n===t||n.contains(t)) ? 'ok@'+Math.round(b.top) : 'OCCL('+String(t&&t.className||'').slice(0,30)+')@'+Math.round(b.top); };
    return {
      cells: [...document.querySelectorAll('.tr-field__cell')].map(hit),
      nextTxt: document.querySelector('.tr-bar__next')?.textContent.replace(/\s+/g,''),
      nextDis: document.querySelector('.tr-bar__next')?.disabled,
      scrollTop: document.querySelector('.tr-panel__scroll')?.scrollTop,
      scrollH: document.querySelector('.tr-panel__scroll')?.scrollHeight,
      clientH: document.querySelector('.tr-panel__scroll')?.clientHeight,
    };
  })();
  log('BEFORE: ' + JSON.stringify(await page.evaluate(probe)));
  await shot('g-before');
  // press ONLY the affordance the app offers
  await page.evaluate(() => document.querySelector('.tr-panel__next')?.click());
  await page.waitForTimeout(900);
  log('AFTER foot "Place it": ' + JSON.stringify(await page.evaluate(probe)));
  await shot('g-after-foot');
  await page.evaluate(() => document.querySelector('.tr-bar__next')?.click());
  await page.waitForTimeout(900);
  log('AFTER bar "Place it": ' + JSON.stringify(await page.evaluate(probe)));
  await shot('g-after-bar');
  // now tap the first cell via a real mouse click at its centre
  const r = await page.evaluate(() => { const c=document.querySelector('.tr-field__cell'); if(!c) return null; const b=c.getBoundingClientRect(); return {x:b.left+b.width/2,y:b.top+b.height/2}; });
  log('cell centre ' + JSON.stringify(r));
  if (r && r.y > 0 && r.y < 844) { await page.mouse.click(r.x, r.y); await page.waitForTimeout(900); }
  log('AFTER real tap: ' + JSON.stringify(await page.evaluate(probe)));
  await shot('g-after-tap');
};
