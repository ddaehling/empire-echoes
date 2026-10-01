const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page); await page.waitForTimeout(1200);
  await page.goto('http://localhost:8777/app/#panel=classroom'); await R.ready(page); await page.waitForTimeout(2000);
  const d = await page.evaluate(() => {
    const sc = document.querySelector('.cx-sheet__body');
    return { title: document.querySelector('.cx-sheet__title')?.textContent,
      eyebrow: document.querySelector('.cx-sheet__eyebrow')?.textContent,
      small: !!document.querySelector('.tp-page--small:not([hidden])'),
      text: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,1200),
      window: sc ? [Math.round(sc.getBoundingClientRect().height), sc.scrollHeight] : null };
  });
  log('DESK@390: ' + JSON.stringify(d));
  await shot('desk-390');
  await page.setViewportSize({width:1366,height:768}); await page.waitForTimeout(1500);
  const d2 = await page.evaluate(() => {
    const sc = document.querySelector('.cx-sheet__body');
    return { title: document.querySelector('.cx-sheet__title')?.textContent,
      small: !!document.querySelector('.tp-page--small:not([hidden])'),
      tabs: [...document.querySelectorAll('.tp__nav button')].map(b=>b.textContent.trim()),
      window: sc ? [Math.round(sc.getBoundingClientRect().height), sc.scrollHeight] : null,
      text: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,900) };
  });
  log('DESK@1366: ' + JSON.stringify(d2));
  await shot('desk-1366');
  await page.setViewportSize({width:844,height:390}); await page.waitForTimeout(1400);
  const d3 = await page.evaluate(() => ({ title: document.querySelector('.cx-sheet__title')?.textContent, small: !!document.querySelector('.tp-page--small:not([hidden])'), text:(document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,400) }));
  log('DESK@844x390: ' + JSON.stringify(d3));
  await shot('desk-844');
};
