module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1200);
  const box = await page.locator('.tp-unit').boundingBox();
  log('UNIT BOX ' + JSON.stringify(box));
  await page.screenshot({ path: (process.env.OUTDIR||'/tmp/pk03') + '/unit.png',
    clip: { x: box.x - 10, y: box.y - 40, width: box.width + 20, height: Math.min(520, box.height + 420) } });
  log('shot: ' + (process.env.OUTDIR||'/tmp/pk03') + '/unit.png');
};
