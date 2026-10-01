module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#tour=period&step=1'; });
  await page.waitForTimeout(1600);
  const b = page.locator('button:has-text("leaves out"), button:has-text("The other route")').first();
  if (!(await b.count())) { log('NO ROUTE-CARD CONTROL'); }
  else { await b.scrollIntoViewIfNeeded().catch(()=>{}); await b.click().catch(e => log('click ' + e.message)); }
  await page.waitForTimeout(1400);
  await shot('card');
  const t = await page.evaluate(() => {
    const el = document.querySelector('.app__sheet') || document.body; return el.innerText;
  });
  log('CARD>>>\n' + t.slice(0, 7000) + '\n<<<');
};
