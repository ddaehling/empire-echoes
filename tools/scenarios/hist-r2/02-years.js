module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const setYear = async (y) => {
    await page.evaluate((yy) => {
      const s = window.__store || window.store || (window.app && window.app.store);
      if (s && s.set) s.set({ year: yy });
      else if (s && s.setYear) s.setYear(yy);
      else window.dispatchEvent(new CustomEvent('atlas:year', { detail: yy }));
    }, y);
    await page.waitForTimeout(900);
  };
  log('store keys', await page.evaluate(() => Object.keys(window).filter(k => /store|atlas|app|bus/i.test(k)).join(',')));
  for (const y of [1900, 1960, 2020]) {
    await setYear(y);
    const labels = await page.evaluate(() => [...document.querySelectorAll('svg text, .map text')].map(t => t.textContent.trim()).filter(Boolean));
    log('YEAR', y, 'shownyear=', (document ? '' : ''), 'labels:', JSON.stringify(labels.slice(0, 200)));
    await shot('year-' + y);
  }
};
