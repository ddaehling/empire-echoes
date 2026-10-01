/* pk/01-desk — open the Teaching desk's Classroom tab and read what it says. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.__printed = []; window.print = () => { window.__printed.push(1); }; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1200);
  await shot('classroom');
  log('UNIT PICKER: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-unit__b')].map(b => b.innerText.replace(/\n/g, ' | ')))));
  log('PACK IDS: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('[data-pack]')].map(x => x.dataset.pack))));
  log('BOARD ROWS: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('.tp-board__si')].map(x => x.innerText.replace(/\n/g, ' | ').slice(0, 200)))));
  log('LESSON HEAD: ' + await page.evaluate(() => {
    const p = [...document.querySelectorAll('.cx-panel__title')].map(x => x.innerText); return JSON.stringify(p);
  }));
  log('ERRORS: ' + JSON.stringify(await page.evaluate(() => window.__errs || [])));
};
