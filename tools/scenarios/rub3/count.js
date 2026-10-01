module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const r = await page.evaluate(async () => {
    const m = await import('/app/js/tours/answers.js');
    const a = m.statusCount(window.BEA.data, 1921, 'claimed');
    return { value: a.value, unit: a.unit, detail: a.detail };
  });
  log(JSON.stringify(r, null, 1));
};
