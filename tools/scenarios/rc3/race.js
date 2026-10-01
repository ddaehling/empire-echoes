module.exports = async ({ page, shot, log }) => {
  for (const d of [0, 100, 300, 600, 1200, 2000]) {
    await page.goto('http://localhost:8777/app/', {waitUntil:'load'});
    await page.waitForTimeout(d);
    await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
    await page.waitForTimeout(2800);
    const o = await page.evaluate(()=>({hash:location.hash.slice(0,60), bar:document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,40)||'NO TOUR'}));
    log('delay ' + d + 'ms => ' + JSON.stringify(o));
  }
};
