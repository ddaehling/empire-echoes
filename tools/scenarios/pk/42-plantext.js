/* pk/42-plantext — DIAGNOSTIC, not an acceptance check: it asserts nothing and
   cannot go red. LESSON=1|2 PACK=plan|key|board|… prints one sheet as text so a
   builder can read what a teacher would read. The checks with teeth are
   p20-accept (on the board) and pk/44-paper. */
module.exports = async ({ page, log }) => {
  const n = Number(process.env.LESSON || 2);
  const pack = process.env.PACK || 'plan';
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1400);
  await page.evaluate((k) => { const b=[...document.querySelectorAll('.tp-unit__b')][k-1]; if(b)b.click(); }, n);
  await page.waitForTimeout(900);
  await page.evaluate((p) => {
    const el=[...document.querySelectorAll('[data-pack]')].find(x=>x.dataset.pack===p);
    (el.tagName==='BUTTON'?el:el.querySelector('button')).click();
  }, pack + '@' + n);
  await page.waitForTimeout(500);
  log(await page.evaluate(() => document.querySelector('.tp-paper').innerText));
};
