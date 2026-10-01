const CASES = [
  ['new-zealand', 1840], ['lagos-colony', 1861], ['barbados', 1700],
  ['kenya', 1920], ['western-samoa', 1914], ['jammu-and-kashmir', 1846],
  ['kedah', 1909], ['great-britain', 1600], ['canada', 1870], ['pennsylvania', 1681],
];
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  for (const [id, year] of CASES) {
    await page.evaluate(([i, y]) => { BEA.store.act.setYear(y); BEA.store.act.select(i); }, [id, year]);
    await page.waitForTimeout(500);
    const txt = await page.evaluate(() => {
      const b = document.querySelector('[data-block=taken]');
      return b ? b.innerText.replace(/\n+/g, ' | ') : 'NO TAKEN BLOCK';
    });
    log(id + ' @' + year + ': ' + txt);
  }
  await shot('nz-lagos-last');
  const errs = await page.evaluate(() => (window.__consoleErrors || []).length);
  log('console errors: ' + errs);
};
