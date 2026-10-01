module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=17&filter=stage:working,pressure:off');
  await page.waitForTimeout(2500);
  log('17: ' + await page.evaluate(()=>document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,60)));
  for (const s of [16,17,18]) {
    await page.goto('http://localhost:8777/app/#tour=core&step='+s+'&filter=stage:working,pressure:off');
    await page.waitForTimeout(2200);
    const o = await page.evaluate(()=>({bar:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,50), lede:(document.querySelector('[class*="lede"]')?.innerText||'').replace(/\s+/g,' ').slice(0,120)}));
    log('step '+s+': '+JSON.stringify(o));
    await shot('s'+s);
  }
  // Find the congo beat through the close
  await page.goto('http://localhost:8777/app/');
  await page.waitForTimeout(2200);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/Finish here/i.test(e.innerText)); if(b)b.click();});
  await page.waitForTimeout(2200);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/One more, off this map/i.test(e.innerText)); if(b)b.click();});
  await page.waitForTimeout(2600);
  await shot('offmap');
  log('OFFMAP >>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,4500));
};
