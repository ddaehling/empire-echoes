module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Teaching desk"), a:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1400);
  const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"], .tt-nav button, .td-nav button, nav button')]
    .map(e => (e.textContent || '').trim().replace(/\s+/g, ' ')).filter(Boolean));
  log('TABS ' + JSON.stringify(tabs));
  await shot('00-desk');
  for (const t of tabs) {
    const b = page.locator('[role="tab"], .tt-nav button, .td-nav button, nav button').filter({ hasText: t }).first();
    if (!(await b.count())) continue;
    await b.click().catch(() => {});
    await page.waitForTimeout(1000);
    const txt = await page.evaluate(() => {
      const p = document.querySelector('[role="tabpanel"], .tt-panel, .td-panel, .tt__body') || document.body;
      return p.innerText;
    });
    log('=== TAB ' + t + ' ===');
    const mins = (txt.match(/[^.\n]{0,160}\bminutes?\b[^.\n]{0,120}/gi) || []);
    log('MINUTES:\n' + (mins.join('\n---\n') || '(none)'));
    await shot('tab-' + t.replace(/[^a-z0-9]+/gi, '-').slice(0, 20));
  }
};
