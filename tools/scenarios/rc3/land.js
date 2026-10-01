module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  const t = await page.evaluate(() => document.body.innerText);
  log('BODYTEXT>>>', t.slice(0, 4000));
  // enumerate buttons
  const btns = await page.evaluate(() => [...document.querySelectorAll('button,a[href],[role=button]')].filter(e=>e.offsetParent!==null).map(e => (e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)));
  log('CONTROLS>>>', JSON.stringify(btns));
};
