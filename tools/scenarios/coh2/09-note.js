module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2200);
  const note = () => page.evaluate(() => (document.querySelector('.stage__note')?.innerText||'').replace(/\n+/g,' | '));
  log('DEF1', await note());
  await page.keyboard.press('3'); await page.waitForTimeout(900); log('DEF3', await note());
  await page.keyboard.press('p'); await page.waitForTimeout(1200); log('DEF3+EqualEarth', await note());
  await page.keyboard.press('w'); await page.waitForTimeout(1200); log('WEIGHT', await note());
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1947)); await page.waitForTimeout(900); log('1947', await note());
};
