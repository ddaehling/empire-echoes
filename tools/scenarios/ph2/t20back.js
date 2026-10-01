const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  await page.reload({waitUntil:'load'}); await R.ready(page); await page.waitForTimeout(1000);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=1'); await R.ready(page); await page.waitForTimeout(1500);
  for (let i=0;i<12;i++) {
    const pos = await page.evaluate(() => document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,20));
    if (/9 \/ 9/.test(pos||'')) break;
    if (await page.evaluate(()=>document.querySelector('.tr-bar__next')?.disabled)) {
      await page.evaluate(() => { const c=document.querySelector('.tr-field__cell'); if(c){c.scrollIntoView({block:'center'});c.click();return;} const s=[...document.querySelectorAll('button')].find(b=>/rather (not|read)/i.test(b.textContent||'')); if(s){s.scrollIntoView({block:'center'});s.click();} });
      await page.waitForTimeout(700);
    }
    if (!await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled){n.click();return true;}return false;})) break;
    await page.waitForTimeout(1300);
  }
  log('AT: ' + await page.evaluate(()=>document.querySelector('.cx-sheet__title')?.textContent));
  // press the tour Next straight away, without committing
  await page.evaluate(()=>document.querySelector('.tr-bar__next')?.click());
  await page.waitForTimeout(1400);
  const n = await page.evaluate(()=>({t:document.querySelector('.cx-sheet__title')?.textContent, pos:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,20), close: !!document.querySelector('.cl-close')}));
  log('AFTER Next (uncommitted): ' + JSON.stringify(n));
  await shot('skip-next');
  // go back and use Skip
  await page.evaluate(()=>document.querySelector('.tr-bar__back')?.click()); await page.waitForTimeout(1400);
  log('BACK: ' + await page.evaluate(()=>document.querySelector('.cx-sheet__title')?.textContent));
  const sk = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Skip — it stays/i.test(x.textContent||'')); if(!b) return 'no-skip'; b.click(); return 'skipped';});
  await page.waitForTimeout(1200);
  log('AFTER Skip: ' + sk + ' -> ' + await page.evaluate(()=>document.querySelector('.cx-sheet__title')?.textContent));
  await shot('after-skip');
  const p = await page.evaluate(()=>(document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,600));
  log('PANEL: ' + p);
};
