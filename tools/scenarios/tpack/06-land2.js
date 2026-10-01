module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  for (const n of [4, 7, 8, 12, 13, 14, 15, 16]) {
    await page.evaluate((s) => { location.hash = '#tour=core&step=' + s; }, n);
    await page.waitForTimeout(1100);
    const got = await page.evaluate(() => {
      const t = document.querySelector('.tr-lede') || document.querySelector('.tr-panel');
      return (t ? t.innerText : document.body.innerText).replace(/\s+/g, ' ').slice(0, 160);
    });
    log('step ' + String(n).padStart(2) + ' :: ' + got);
  }
};
