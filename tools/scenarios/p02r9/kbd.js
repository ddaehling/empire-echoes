module.exports = async ({ page, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1800);
  const stops = [];
  await page.evaluate(() => document.body.focus());
  for (let i = 0; i < 26; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => {
      const a = document.activeElement; if (!a) return '-';
      return (a.className || a.tagName) + ' :: ' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 44);
    }));
  }
  log(stops.map((s, i) => (i + 1) + '. ' + s).join('\n'));
  // keys 1-4 still change the reading
  await page.keyboard.press('3');
  await page.waitForTimeout(600);
  log('after key 3: ' + await page.evaluate(() => window.BEA.registry.get('map').mod.definition));
};
