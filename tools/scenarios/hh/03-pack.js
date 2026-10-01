/* hh/03-pack — the printed classroom pack, as paper. Print emulation + A4 PDF + text. */
const fs = require('fs');
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);

  const dir = process.env.HHDIR || '/tmp/hh-pack';
  fs.mkdirSync(dir, { recursive: true });
  await page.emulateMedia({ media: 'print' });
  const packs = await page.evaluate(() => [...document.querySelectorAll('[data-pack]')].map(b => b.dataset.pack));
  log('PACK IDS: ' + JSON.stringify([...new Set(packs)]));
  for (const id of [...new Set(packs)]) {
    const ok = await page.evaluate((pid) => {
      const li = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === pid);
      if (!li) return false;
      const b = li.querySelector('button') || li;
      b.click(); return true;
    }, id);
    if (!ok) { log('MISSING ' + id); continue; }
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      return p ? p.innerText : '(no .tp-paper)';
    });
    try { await page.pdf({ path: dir + '/' + id + '.pdf', printBackground: true, preferCSSPageSize: true }); } catch (e) { log('pdf fail ' + id + ' ' + e.message); }
    log('\n\n############ PACK: ' + id + ' ############\n' + t);
  }
};
