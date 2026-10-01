/* pk/43-desk — DIAGNOSTIC, not an acceptance check: it asserts nothing and
   cannot go red. It dumps the desk's lesson rows, its four transferable moves
   and its pack catalogue as text. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1400);
  log('ROWS ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-lesson__step')].map(n => n.innerText.replace(/\s+/g,' ')))));
  log('MOVES ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-moves__i')].map(n => n.innerText.replace(/\s+/g,' ')))));
  log('PACKS ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-packs__t')].map(n => n.innerText.replace(/\s+/g,' ')))));
};
