module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const rail = page.locator('[role="slider"]').first();
  const setYear = async (y) => {
    await rail.focus();
    let cur = Number(await rail.getAttribute('aria-valuenow'));
    let guard = 0;
    while (cur !== y && guard++ < 1500) {
      await page.keyboard.press(y > cur ? 'ArrowRight' : 'ArrowLeft');
      cur = Number(await rail.getAttribute('aria-valuenow'));
    }
    await page.waitForTimeout(900);
    return cur;
  };
  for (const y of [1922, 1960, 2020]) {
    const got = await setYear(y);
    const txt = await page.evaluate(() => {
      const g = document.querySelector('.map, #map, [class*="map"]');
      return (g ? g.innerText : document.body.innerText).replace(/\s+/g, ' ').slice(0, 1400);
    });
    log('=== YEAR', y, 'got', got, '::', txt);
    await shot('year-' + y);
  }
};
