module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('TITLE', await page.title());
  log('TEXT', (await page.evaluate(() => document.body.innerText)).slice(0, 2500));
  // enumerate top-level buttons
  const btns = await page.evaluate(() => [...document.querySelectorAll('button,a[href],[role=button]')]
    .filter(e => e.offsetParent !== null)
    .slice(0, 60)
    .map(e => (e.tagName + ' :: ' + (e.getAttribute('aria-label') || e.innerText || '').replace(/\s+/g,' ').trim()).slice(0,110)));
  log('CONTROLS', JSON.stringify(btns, null, 1));
};
