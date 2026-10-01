const R = require('../lib/routes.js');
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.goto('http://localhost:8777/app/#tour=lesson-two&step=9');
  await R.ready(page); await page.waitForTimeout(1800);
  const s0 = await page.evaluate(() => ({
    title: document.querySelector('.cx-sheet__title')?.textContent,
    lede: document.querySelector('.app__lede')?.innerText.replace(/\s+/g,' ').slice(0,200),
    panel: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,2500),
  }));
  log('TITLE: ' + s0.title); log('LEDE: ' + s0.lede);
  log('PANEL: ' + s0.panel);
  await shot('t20-0');
  // commit the slider
  await page.evaluate(() => {
    const r = document.querySelector('.qz__range, .app__sheet input[type=range]');
    if (r) { r.value = String((+r.max + +r.min)/2); r.dispatchEvent(new Event('input',{bubbles:true})); r.dispatchEvent(new Event('change',{bubbles:true})); }
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.qz__commit')?.click());
  await page.waitForTimeout(1200);
  const s1 = await page.evaluate(() => ({ panel: (document.querySelector('.app__sheet')?.innerText||'').replace(/\s+/g,' ').slice(0,3000) }));
  log('AFTER COMMIT: ' + s1.panel);
  await shot('t20-committed');
};
