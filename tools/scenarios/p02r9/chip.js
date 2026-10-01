module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1800);
  const chip = page.locator('.map__defchip');
  log('chip visible: ' + await chip.isVisible() + '  name: ' + JSON.stringify(await chip.getAttribute('aria-label')));
  await chip.click();
  await page.waitForTimeout(1200);
  await shot('sheet');
  log(JSON.stringify(await page.evaluate(() => {
    const defs = [...document.querySelectorAll('.map__switch--sheet .map__def')];
    return { n: defs.length, labels: defs.map(d => d.textContent.trim()),
      on: defs.filter(d => d.classList.contains('is-on')).map(d => d.textContent.trim()),
      boxes: defs.map(d => { const r = d.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.y); }) };
  }), null, 1));
  // press "3 controlled"
  await page.locator('.map__switch--sheet .map__def').nth(2).click();
  await page.waitForTimeout(1200);
  log('after press: definition=' + await page.evaluate(() => window.BEA.registry.get('map').mod.definition)
    + '  chip=' + await page.locator('.map__defchip').innerText());
  await shot('after');
};
