module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>/teaching desk|§/i.test(x.innerText||'')); if(b)b.click(); });
  await page.waitForTimeout(1500);
  log('SMALL TEXT: ' + JSON.stringify(await page.evaluate(() => {
    const s=document.querySelector('.tp-page--small'); return s? s.innerText : null; })));
  const b = await page.locator('.cx-sheet__body');
  log('WINDOW ' + JSON.stringify(await page.evaluate(() => {
    const x=document.querySelector('.cx-sheet__body');
    return { read: x.clientHeight, holds: x.scrollHeight, screens: +(x.scrollHeight/x.clientHeight).toFixed(1) }; })));
  await shot('small-top');
  await page.evaluate(() => { document.querySelector('.cx-sheet__body').scrollTop = 400; });
  await page.waitForTimeout(300); await shot('small-mid');
  await page.evaluate(() => { const x=document.querySelector('.cx-sheet__body'); x.scrollTop = x.scrollHeight; });
  await page.waitForTimeout(300); await shot('small-end');
};
