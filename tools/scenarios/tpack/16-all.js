/* tpack/16-all — every sheet in the pack, as A4 PDF, at its own @page size. */
const fs = require('fs');
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  const dir = process.env.TPDIR || '/tmp/tp-r2/all';
  fs.mkdirSync(dir, { recursive: true });
  const ids = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-pack]')].map(n => n.dataset.pack))]);
  log('PACKS: ' + JSON.stringify(ids));
  for (const id of ids) {
    await page.evaluate((pid) => {
      const li = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === pid);
      if (li) li.querySelector('button').click();
    }, id);
    await page.waitForTimeout(500);
    const meta = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      return p ? { title: (p.querySelector('.tp-paper__pack') || {}).innerText, chars: p.innerText.length } : null;
    });
    try { await page.pdf({ path: dir + '/' + id + '.pdf', printBackground: true, preferCSSPageSize: true }); }
    catch (e) { log('PDF FAIL ' + id + ' ' + e.message); }
    log(id + ' ' + JSON.stringify(meta));
  }
};
