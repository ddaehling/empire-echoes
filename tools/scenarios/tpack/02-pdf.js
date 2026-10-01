/* tpack/02-pdf — the five classroom sheets as A4 PDF, using the sheet's own @page. */
const fs = require('fs');
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);

  const dir = process.env.TPDIR || '/tmp/tp-r2/pdf2';
  fs.mkdirSync(dir, { recursive: true });
  const want = ['plan', 'tasks-core', 'tasks-supported', 'tasks-extension', 'key', 'questions', 'lesson', 'board'];
  for (const id of want) {
    const ok = await page.evaluate((pid) => {
      const b = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === pid);
      if (b) { (b.tagName === 'BUTTON' ? b : b.querySelector('button')).click(); return 'data-pack'; }
      return null;
    }, id);
    if (!ok) { log('NO CONTROL for ' + id); continue; }
    await page.waitForTimeout(400);
    const meta = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      return p ? { title: (p.querySelector('.tp-paper__pack') || {}).innerText, chars: p.innerText.length } : null;
    });
    try { await page.pdf({ path: dir + '/' + id + '.pdf', printBackground: true, preferCSSPageSize: true }); }
    catch (e) { log('PDF FAIL ' + id + ' ' + e.message); }
    log('SHEET ' + id + ' ' + JSON.stringify(meta));
  }
};
