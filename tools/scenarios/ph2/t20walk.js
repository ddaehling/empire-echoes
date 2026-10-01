const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  await page.reload({ waitUntil: 'load' }); await R.ready(page); await page.waitForTimeout(1000);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=1');
  await R.ready(page); await page.waitForTimeout(1500);
  for (let i=0;i<12;i++) {
    const st = await page.evaluate(() => ({ pos: document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,20), title: document.querySelector('.cx-sheet__title')?.textContent, dis: document.querySelector('.tr-bar__next')?.disabled }));
    log(i + ' ' + st.pos + ' | ' + st.title + ' dis=' + st.dis);
    if (/9 \/ 9/.test(st.pos||'')) break;
    if (st.dis) {
      await page.evaluate(() => { const c=document.querySelector('.tr-field__cell'); if(c){c.scrollIntoView({block:'center'});c.click();return;} const s=[...document.querySelectorAll('button')].find(b=>/rather (not|read)/i.test(b.textContent||'')); if(s){s.scrollIntoView({block:'center'});s.click();} });
      await page.waitForTimeout(700);
    }
    const m = await page.evaluate(() => { const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled){n.click();return true;} return false; });
    if(!m){log('stuck');break;}
    await page.waitForTimeout(1400);
  }
  await shot('w-step9');
  const a = await page.evaluate(() => ({ title: document.querySelector('.cx-sheet__title')?.textContent, panel: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,1400) }));
  log('STEP9 TITLE: ' + a.title); log('STEP9 PANEL: ' + a.panel);
  await page.evaluate(() => { const r=document.querySelector('.app__sheet input[type=range]'); if(r){r.value='3';r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));} });
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.qz__commit')?.click());
  await page.waitForTimeout(1400);
  const b = await page.evaluate(() => ({ title: document.querySelector('.cx-sheet__title')?.textContent, panel: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,2200) }));
  log('AFTER COMMIT TITLE: ' + b.title); log('AFTER COMMIT: ' + b.panel);
  await shot('w-committed');
};
