module.exports = async ({ page, shot, log }) => {
  const p = process.env.RUB_PANEL || 'classroom';
  await page.goto('http://localhost:8777/app/#panel=' + p, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(4000);
  await shot('desk-' + p);
  const txt = await page.evaluate(() => {
    const o = document.querySelector('.tp, .tp-page, .app__overlay') || document.body;
    return o.innerText;
  });
  log('DESK ' + p + ' TEXT (' + txt.length + ' chars):\n' + txt);
};
