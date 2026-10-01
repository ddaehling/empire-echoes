module.exports = async ({ page, shot, log }) => {
  for (const s of [10,12,13,14,15]) {
    await page.goto('http://localhost:8777/app/#tour=core&step=' + s + '&filter=stage:working,pressure:off');
    await page.waitForTimeout(2200);
    const bar = await page.evaluate(()=>document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,90)||'');
    log('=== step ' + s + ' | ' + bar + ' | ' + page.url().replace(/.*#/,'').slice(0,80));
    const panel = await page.evaluate(()=>{ const els=[...document.querySelectorAll('*')].filter(e=>e.className && String(e.className).includes('cx-') && e.innerText && e.innerText.length>300); return els.length? els[0].innerText : (document.body.innerText.slice(0,3000)); });
    log(panel.slice(0,3200));
    await shot('step'+s);
  }
};
