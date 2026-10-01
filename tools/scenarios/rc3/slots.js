module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Start the lesson/i.test(e.innerText)); b.click();});
  await page.waitForTimeout(1200);
  for (let s=1;s<=15;s++){
    await page.goto('http://localhost:8777/app/#tour=core&step='+s+'&filter=stage:working,pressure:off');
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(1200);
  const c = await page.evaluate(()=>{ const e=[...document.querySelectorAll('*')].find(x=>/^\d\/6$|^\d of 6$/.test(x.textContent.trim())); return e?e.textContent.trim():'?'; });
  log('counter after visiting all 15 core steps: ' + c);
  const say = await page.evaluate(()=>{ const e=document.querySelector('.cl-say, [class*="cl-say"]'); return e?e.innerText.replace(/\s+/g,' '):'no say'; });
  log('sentence: ' + say);
  await shot('slots');
  // now the full path
  for (let s=1;s<=25;s++){ await page.goto('http://localhost:8777/app/#tour=thirty&step='+s+'&filter=stage:working,pressure:off'); await page.waitForTimeout(900); }
  await page.waitForTimeout(1000);
  log('after thirty: ' + await page.evaluate(()=>{ const e=[...document.querySelectorAll('*')].find(x=>/^\d\/6$/.test(x.textContent.trim())); return e?e.textContent.trim():'?'; }));
  log('sentence2: ' + await page.evaluate(()=>{ const e=document.querySelector('[class*="cl-say"]'); return e?e.innerText.replace(/\s+/g,' '):'no'; }));
};
