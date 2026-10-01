const STEP = process.env.STEP || '1';
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate((h) => { location.hash = h; }, '#tour=core&step=' + STEP);
  await page.waitForTimeout(3200);
  const d = await page.evaluate(() => {
    const scr = document.querySelector('.tr-panel__scroll');
    const trim = parseFloat(scr.style.getPropertyValue('--tr-trim')) || 0;
    const full = scr.clientHeight + trim;
    const lhs = [...scr.querySelectorAll('p, li')].slice(0, 6).map(p => parseFloat(getComputedStyle(p).lineHeight));
    const lh = Math.max(...lhs);
    return { h: scr.clientHeight, trim, full, lhs, lh, rem: +(full % lh).toFixed(1), frac: +((full % lh) / lh).toFixed(2), cut: scr.style.getPropertyValue('--tr-cut') };
  });
  log(JSON.stringify(d));
};
