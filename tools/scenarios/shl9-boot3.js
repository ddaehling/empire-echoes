module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  await page.addInitScript(() => { window.__x = (window.__x || 0) + 1; window.__hash0 = location.hash; });
  await page.goto(base + '#tour=lesson-one&step=9', { waitUntil: 'commit' });
  await page.waitForTimeout(1500);
  log('x=', await page.evaluate(() => String(window.__x) + ' hash0=' + window.__hash0 + ' now=' + location.hash));
};
