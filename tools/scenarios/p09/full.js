module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(1300);
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true, sort: 'left' }));
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    return { scrollH: b.scrollHeight, clientH: b.clientHeight };
  });
  log('SHEET ' + JSON.stringify(h));
  const steps = Math.ceil(h.scrollH / h.clientH);
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => { document.querySelector('.cx-sheet__body').scrollTop = y; }, i * (h.clientH - 40));
    await page.waitForTimeout(250);
    await shot('pane-' + (i + 1));
  }
  log('TEXT ' + await page.evaluate(() => document.querySelector('.mx').innerText.length) + ' chars');
};
