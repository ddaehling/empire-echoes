const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.evaluate(()=>{try{localStorage.clear();}catch(_){}}); await page.reload({waitUntil:'load'}); await R.ready(page); await page.waitForTimeout(1000);
  await page.goto('http://localhost:8777/app/#tour=' + (process.env.PH_R||'lesson-two') + '&step=1'); await R.ready(page); await page.waitForTimeout(1600);
  const seen = [];
  for (let i=0;i<14;i++) {
    const s = await page.evaluate(() => ({
      pos: document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,18),
      title: document.querySelector('.cx-sheet__title')?.textContent,
      isQuiz: !!document.querySelector('.qz__commit, .qz'),
      hasBeat: !!document.querySelector('.tr-panel__scroll'),
      close: !!document.querySelector('.cl-close'),
      back: [...document.querySelectorAll('button, a')].some(b=>/Back to the lesson/i.test(b.textContent||'')),
    }));
    log(i + ' | ' + s.pos + ' | "' + s.title + '" quiz=' + s.isQuiz + ' beatPanel=' + s.hasBeat + ' backLink=' + s.back);
    seen.push(s.title);
    if (s.close) break;
    if (s.isQuiz) {
      // behave like a student: commit, read reveal, then press the primary Next
      await page.evaluate(() => { const r=document.querySelector('.app__sheet input[type=range]'); if(r){r.value=String(((+r.max)+(+r.min))/2); r.dispatchEvent(new Event('input',{bubbles:true})); r.dispatchEvent(new Event('change',{bubbles:true}));}
        const opt=document.querySelector('.qz__opt, .qz__choice'); if(opt) opt.click(); });
      await page.waitForTimeout(400);
      await page.evaluate(()=>{const c=document.querySelector('.qz__commit'); if(c&&!c.disabled) c.click();});
      await page.waitForTimeout(1200);
      const after = await page.evaluate(() => ({ title: document.querySelector('.cx-sheet__title')?.textContent, beat: !!document.querySelector('.tr-panel__scroll'), back: [...document.querySelectorAll('button, a')].some(b=>/Back to the lesson/i.test(b.textContent||'')) }));
      log('    after commit: "' + after.title + '" beatPanel=' + after.beat + ' backLink=' + after.back);
      await shot('q' + i);
    }
    if (await page.evaluate(()=>document.querySelector('.tr-bar__next')?.disabled)) {
      await page.evaluate(() => { const c=document.querySelector('.tr-field__cell'); if(c){c.scrollIntoView({block:'center'});c.click();return;} const s=[...document.querySelectorAll('button')].find(b=>/rather (not|read)/i.test(b.textContent||'')); if(s){s.scrollIntoView({block:'center'});s.click();} });
      await page.waitForTimeout(800);
    }
    if(!await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled){n.click();return true;}return false;})) { log('stuck'); break; }
    await page.waitForTimeout(1500);
  }
  log('SEEN: ' + JSON.stringify(seen));
  const close = await page.evaluate(() => (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,900));
  log('CLOSE: ' + close);
};
