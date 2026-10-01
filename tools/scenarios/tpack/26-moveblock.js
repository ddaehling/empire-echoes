module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => [...document.querySelectorAll('.tp-moves__i')].map(li => li.innerText.replace(/\s+/g, ' ')));
  log(JSON.stringify(info, null, 1));
  await page.evaluate(() => { const n = document.querySelector('.tp-moves'); if (n) n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  await shot('moves');
};
