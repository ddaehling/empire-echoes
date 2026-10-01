module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__p = 0; window.print = () => { window.__p++; }; });
  await page.getByRole('button', { name: /Teaching desk/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  log('buttons: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-pack]')].map(b => [b.tagName, b.dataset.pack, b.offsetParent !== null, (b.textContent||'').trim().slice(0,20)]))));
  await page.locator('[data-pack="plan"]').first().click();
  await page.waitForTimeout(1500);
  log('printed=' + await page.evaluate(() => window.__p));
  log('paper: ' + await page.evaluate(() => { const p = document.querySelector('.tp-paper'); return p ? p.textContent.length : 'none'; }));
};
