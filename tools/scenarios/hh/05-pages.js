/* hh/05-pages — how many A4 pages does each printed sheet actually take? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  await page.emulateMedia({ media: 'print' });
  const ids = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-pack]')].map(b => b.dataset.pack))]);
  for (const id of ids) {
    await page.evaluate((pid) => {
      const li = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === pid);
      (li.querySelector('button') || li).click();
    }, id);
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      if (!p) return null;
      const mm = (v) => Math.round(v / (96 / 25.4));
      const r = p.getBoundingClientRect();
      return { w: mm(r.width), h: mm(p.scrollHeight), body: mm((document.querySelector('.tp-paper__body')||p).scrollHeight) };
    });
    log(id.padEnd(18) + ' paper ' + m.w + 'mm x ' + m.h + 'mm  ~= ' + (m.h / 260).toFixed(2) + ' A4 text pages');
  }
};
