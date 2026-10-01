module.exports = async ({ page, shot, log }) => {
  for (const h of ['#tour=core&step=6&filter=stage:working,pressure:off','#tour=core&step=6','#tour=core&step=2','#tour=core&step=6&filter=stage:working,pressure:off']) {
    await page.goto('http://localhost:8777/app/' + h, { waitUntil:'load' });
    await page.waitForTimeout(2600);
    const o = await page.evaluate(()=>({hash:location.hash, bar:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,60)||'NO TR-BAR', lede:(document.querySelector('[class*="lede"]')?.innerText||'').replace(/\s+/g,' ').slice(0,110)}));
    log(h + '  ==>  ' + JSON.stringify(o));
  }
  // hard reload on the beat
  await page.reload({waitUntil:'load'});
  await page.waitForTimeout(2500);
  log('after reload: ' + JSON.stringify(await page.evaluate(()=>({hash:location.hash, bar:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,60)||'NO TR-BAR'}))));
  await shot('deep6');
};
