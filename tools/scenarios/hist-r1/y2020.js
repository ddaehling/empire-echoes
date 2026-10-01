module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const setYear = async (y) => {
    await page.evaluate((yy) => {
      if (window.__store && window.__store.set) window.__store.set({ year: yy });
      const u = new URL(location.href); u.searchParams.set('year', yy); history.replaceState({}, '', u);
    }, y);
    await page.waitForTimeout(400);
  };
  // try URL route
  for (const y of [2020, 1971, 1965, 1956, 1922, 1858]) {
    await page.goto('http://localhost:8777/app/?year=' + y);
    await page.waitForTimeout(2600);
    const labels = await page.evaluate(() => [...document.querySelectorAll('svg text, .map text')].map(t=>t.textContent.trim()).filter(Boolean));
    log('YEAR ' + y + ' labels(' + labels.length + '): ' + labels.join(' | '));
    await shot('y' + y);
  }
};
