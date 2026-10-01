module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  for (const b of ['poster','spine','resistance','compensation','revenue-loop','egypt','scramble','two-track','two-in-tension','exits','fourteen','congo']) {
    await page.evaluate((x) => window.BEA.bus.emit('tours:goBeat', { id: x }), b);
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => ({
      aux: (document.querySelector('.tr-bar__auxb') || {}).textContent || null,
      entry: (document.querySelector('.tp-entry') || {}).textContent || null,
      count: (document.querySelector('.tr-count') || {}).textContent || null,
    }));
    log(b + ' :: ' + JSON.stringify(st));
  }
};
