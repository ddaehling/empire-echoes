/* pk/41-clock — DIAGNOSTIC, not an acceptance check: it asserts nothing and
   cannot go red. It prints the desk's two lesson clocks so a builder can see
   what `timing.js::routeClock` decided. The check with teeth is p20-accept. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1500);
  for (const n of [1, 2]) {
    await page.evaluate((k) => { const b=[...document.querySelectorAll('.tp-unit__b')][k-1]; if(b)b.click(); }, n);
    await page.waitForTimeout(700);
    log('L' + n + ' head: ' + JSON.stringify(await page.evaluate(() => {
      const h = document.querySelector('.tp-unit');
      return h ? h.innerText.slice(0, 700) : null;
    })));
  }
};
