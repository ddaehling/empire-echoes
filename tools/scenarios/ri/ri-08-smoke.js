module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  log('headline audit (historiography): ' + await page.evaluate(() => {
    try {
      const h = window.BEA && window.BEA.historiography;
      if (!h || !h.audit) return 'panel not mounted';
      const a = h.audit();
      return JSON.stringify(Array.isArray(a) ? a.slice(0, 3) : a).slice(0, 300);
    } catch (e) { return 'threw: ' + e.message; }
  }));
  log('warrant published: ' + await page.evaluate(() => !!(window.BEA.warrant && window.BEA.warrant.contract)));
  for (const id of ['british-india', 'new-zealand', 'hong-kong', 'nigeria', 'canada', 'egypt', 'jamaica', 'malta']) {
    await page.evaluate((i) => BEA.store.act.select(i), id);
    await page.waitForTimeout(350);
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  // keyboard: tab into the dossier and check focus is visible
  await page.evaluate(() => BEA.store.act.select('barbados'));
  await page.waitForTimeout(900);
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  log('focus: ' + await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + (a.className || '').slice(0, 40) : 'none'; }));
  await shot('keyboard-focus');
};
