module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  for (const [beat, name] of [['two-track', 'm2'], ['fourteen', 'm4']]) {
    await page.evaluate((x) => window.BEA.bus.emit('tours:goBeat', { id: x }), beat);
    await page.waitForTimeout(900);
    await page.evaluate(() => { const a = document.querySelector('.tr-bar__auxb'); if (a) a.click(); });
    await page.waitForTimeout(1000);
    const info = await page.evaluate(() => {
      const r = document.querySelector('.tp-mv');
      return r ? { eyebrow: (document.querySelector('.cx-sheet__eyebrow') || {}).innerText,
                   title: (document.querySelector('.cx-sheet__title') || {}).innerText,
                   where: (r.querySelector('.tp-mv__where') || {}).innerText,
                   primer: (r.querySelector('.tp-mv__primer') || {}).innerText || null,
                   opts: r.querySelectorAll('.tp-mv__opt').length } : 'no card';
    });
    log(name + ' card: ' + JSON.stringify(info, null, 1));
    await shot(name);
  }
};
