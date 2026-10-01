const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  const snap = async (tag) => {
    const m = await page.evaluate(() => {
      const b=(s)=>{const n=document.querySelector(s); if(!n) return null; const r=n.getBoundingClientRect(); return [Math.round(r.width),Math.round(r.height),Math.round(r.top)];};
      const sc=document.querySelector('.tr-panel__scroll');
      const over = (() => { // does anything of ours overlap the year line?
        const t=document.querySelector('.app__time'); if(!t) return 'no-time';
        const tr=t.getBoundingClientRect();
        return [...document.querySelectorAll('.tr-panel, .cl-blk, .app__sheet')].map(n=>{const r=n.getBoundingClientRect();
          const ov=Math.max(0,Math.min(r.bottom,tr.bottom)-Math.max(r.top,tr.top))*Math.max(0,Math.min(r.right,tr.right)-Math.max(r.left,tr.left));
          return String(n.className).slice(0,18)+':'+Math.round(ov);}).join(' ');
      })();
      return { vp:[innerWidth,innerHeight], title:document.querySelector('.cx-sheet__title')?.textContent,
        pos:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,18),
        lede:b('.app__lede'), map:b('.stage__map'), sheet:b('.app__sheet'), time:b('.app__time'),
        readable: sc?[Math.round(sc.getBoundingClientRect().height), sc.scrollHeight]:null,
        docScroll: document.documentElement.scrollHeight - innerHeight,
        clip: (()=>{ // any text cut off at the panel edges
          const s=document.querySelector('.tr-panel__scroll'); if(!s) return 'n/a';
          return s.scrollWidth - s.clientWidth; })(),
        overlapTime: over,
        nextDis: document.querySelector('.tr-bar__next')?.disabled,
      };
    });
    log(tag + ' ' + JSON.stringify(m));
    await shot(tag);
  };
  await R.ready(page);
  await page.evaluate(()=>{try{localStorage.clear();}catch(_){}}); await page.reload({waitUntil:'load'}); await R.ready(page); await page.waitForTimeout(1000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://localhost:8777/app/#tour=lesson-one&step=1'); await R.ready(page); await page.waitForTimeout(1500);
  await snap('p-01');
  for (const s of [2,3,4]) { await page.evaluate(()=>document.querySelector('.tr-bar__next')?.click()); await page.waitForTimeout(1300); await snap('p-0'+s); }
  // ROTATE
  await page.setViewportSize({width:844,height:390});
  await page.waitForTimeout(1400);
  await snap('L-04-after-rotate');
  // continue in landscape through the gate
  for (let i=0;i<7;i++) {
    if (await page.evaluate(()=>document.querySelector('.tr-bar__next')?.disabled)) {
      const r = await page.evaluate(()=>{const c=document.querySelector('.tr-field__cell'); if(c){const b=c.getBoundingClientRect(); const t=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2); const occ = t? (c.contains(t)?'ok':'OCCL:'+String(t.className).slice(0,24)) : 'off'; c.scrollIntoView({block:'center'}); c.click(); return 'cell '+occ+' @'+Math.round(b.top);} const s=[...document.querySelectorAll('button')].find(b=>/rather (not|read)/i.test(b.textContent||'')); if(s){s.scrollIntoView({block:'center'});s.click();return 'declined';} return 'none';});
      log('  unlock: ' + r); await page.waitForTimeout(800);
    }
    if(!await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled){n.click();return true;}return false;})) { log('stuck'); break; }
    await page.waitForTimeout(1300);
    await snap('L-' + (i+5));
    if (await page.evaluate(()=>!!document.querySelector('.cl-close'))) { log('CLOSE in landscape'); break; }
  }
  // now 740x360
  await page.setViewportSize({width:740,height:360}); await page.waitForTimeout(1200);
  await snap('S-close-740');
};
