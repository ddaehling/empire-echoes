/* hh/02-desk — the Teaching desk, every tab, full text. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.getByRole('button', { name: /Teaching desk/i }).click();
  await page.waitForTimeout(1200);
  await shot('desk-open');
  const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map(t => t.textContent.trim()));
  log('TABS: ' + JSON.stringify(tabs));
  for (const name of tabs) {
    try { await page.getByRole('tab', { name: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }).click(); }
    catch (e) { log('tab click fail ' + name + ': ' + e.message); continue; }
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => {
      const p = document.querySelector('[role="tabpanel"]:not([hidden])') || document.querySelector('.tp__body') || document.body;
      return p.innerText;
    });
    log('\n\n========== TAB: ' + name + ' ==========\n' + t);
    await shot('tab-' + name.replace(/[^\w]+/g, '-').toLowerCase());
  }
};
