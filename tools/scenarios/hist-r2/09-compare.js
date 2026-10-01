module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=3', { waitUntil: 'load' });
  await page.waitForTimeout(2800);
  const before = await page.evaluate(() => ({ hash: location.hash, body: document.body.innerText.replace(/\s+/g,' ').slice(0,600) }));
  log('BEFORE', JSON.stringify(before));
  const c = page.getByRole('button', { name: /Compare/i });
  log('compare buttons', await c.count());
  if (await c.count()) {
    await c.first().click({ force: true });
    await page.waitForTimeout(1800);
    await shot('compare-in-beat');
    const after = await page.evaluate(() => {
      const yrs = [...document.body.innerText.matchAll(/\b1[5-9]\d{2}\b/g)].map(m=>m[0]);
      return { hash: location.hash, yrs: [...new Set(yrs)].slice(0,20), surfaces: [...document.querySelectorAll('#sheet, .cmp, [class*="cmp"], [class*="compare"]')].filter(e=>e.offsetParent).length, text: document.body.innerText.replace(/\s+/g,' ').slice(0,1600) };
    });
    log('AFTER', JSON.stringify(after, null, 1));
  }
};
