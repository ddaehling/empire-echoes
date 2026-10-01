const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=4');
  await R.ready(page); await page.waitForTimeout(1800);
  const n = await page.$$('.tr-source__in');
  log('found ' + n.length + ' textareas');
  for (let i = 0; i < n.length; i++) {
    await n[i].scrollIntoViewIfNeeded();
    await n[i].click();
    await page.keyboard.type('A printed parliamentary paper reproducing a letter.');
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => {
      const go = document.querySelector('.tr-source__go');
      const txt = (document.querySelector('.tr-panel')?.innerText||'').match(/\d of 4 written/);
      return { goDis: go?.disabled, count: txt && txt[0], next: document.querySelector('.tr-bar__next')?.disabled };
    });
    log('  after field ' + (i+1) + ': ' + JSON.stringify(s));
  }
  await shot('typed-all');
  const geom = await page.evaluate(() => {
    const go = document.querySelector('.tr-source__go'); const b = go.getBoundingClientRect();
    const cx=b.left+b.width/2, cy=b.top+b.height/2;
    const t = (cx>0&&cy>0&&cx<innerWidth&&cy<innerHeight) ? document.elementFromPoint(cx,cy) : null;
    return { top: Math.round(b.top), h: Math.round(b.height), w: Math.round(b.width), hit: t ? (go===t||go.contains(t)) : 'offscreen' };
  });
  log('GO button geom: ' + JSON.stringify(geom));
  await page.evaluate(() => { const g=document.querySelector('.tr-source__go'); g.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(300);
  const g2 = await page.evaluate(() => { const go=document.querySelector('.tr-source__go'); const b=go.getBoundingClientRect(); const t=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2); return {top:Math.round(b.top), hit: t?(go===t||go.contains(t)):'none', cls: t?String(t.className).slice(0,30):''}; });
  log('GO after scroll: ' + JSON.stringify(g2));
  await page.evaluate(() => document.querySelector('.tr-source__go')?.click());
  await page.waitForTimeout(1000);
  const after = await page.evaluate(() => ({ next: document.querySelector('.tr-bar__next')?.textContent.replace(/\s+/g,''), dis: document.querySelector('.tr-bar__next')?.disabled, txt: (document.querySelector('.tr-panel__scroll')?.innerText||'').replace(/\s+/g,' ').slice(0,1200) }));
  log('AFTER GO: next=' + after.next + ' dis=' + after.dis);
  log('PANEL: ' + after.txt);
  await shot('after-go');
};
