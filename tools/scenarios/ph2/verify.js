const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.evaluate(()=>{try{localStorage.clear();}catch(_){}}); await page.reload({waitUntil:'load'}); await R.ready(page); await page.waitForTimeout(1200);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=1'); await R.ready(page); await page.waitForTimeout(2000);
  for (let k=1;k<=4;k++) {
    if (await page.evaluate(()=>document.querySelector('.tr-bar__next')?.disabled)) {
      await page.evaluate(()=>{const s=[...document.querySelectorAll('button')].find(b=>/rather read/i.test(b.textContent||'')); if(s){s.scrollIntoView({block:'center'});s.click();}});
      await page.waitForTimeout(900);
    }
    await page.evaluate(()=>document.querySelector('.tr-bar__next')?.click());
    await page.waitForTimeout(3500);
    log('after press ' + k + ': ' + await page.evaluate(()=>document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,16) + ' :: ' + document.querySelector('.cx-sheet__title')?.textContent));
  }
  await page.waitForTimeout(4000);
  const s = await page.evaluate(()=>({ pos:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,16), title:document.querySelector('.cx-sheet__title')?.textContent,
    twoTrackOnScreen: /Durham|1839|refused|given/.test(document.querySelector('.app__sheet')?.innerText||''),
    body: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,700)}));
  log('SETTLED step5: ' + JSON.stringify(s));
  await shot('l2-step5-settled');
};
