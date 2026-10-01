module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const rail = page.locator('[role="slider"]').first();
  log('rail count', await page.locator('[role="slider"]').count());
  const setYear = async (y) => {
    await rail.focus();
    let cur = Number(await rail.getAttribute('aria-valuenow'));
    let guard = 0;
    while (cur !== y && guard++ < 900) {
      const d = y > cur ? 1 : -1;
      const big = Math.abs(y - cur) >= 10;
      await page.keyboard.press(d > 0 ? (big ? 'PageUp' : 'ArrowRight') : (big ? 'PageDown' : 'ArrowLeft'));
      const nxt = Number(await rail.getAttribute('aria-valuenow'));
      if (nxt === cur) break;
      cur = nxt;
    }
    await page.waitForTimeout(700);
    return cur;
  };
  for (const y of [1900, 1960, 2020]) {
    const got = await setYear(y);
    const labels = await page.evaluate(() => [...document.querySelectorAll('svg text')].map(t => t.textContent.trim()).filter(Boolean));
    log('YEAR requested', y, 'got', got, 'labels', JSON.stringify(labels.slice(0, 160)));
    await shot('year-' + y);
  }
};
