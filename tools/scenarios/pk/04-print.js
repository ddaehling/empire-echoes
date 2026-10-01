/* pk/04-print — every lesson sheet as real A4, page-counted, text read back. */
const fs = require('fs');
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1200);

  const dir = process.env.OUTDIR || '/tmp/pk04';
  fs.mkdirSync(dir, { recursive: true });
  const ids = ['plan', 'tasks-core', 'tasks-supported', 'tasks-extension', 'key', 'board', 'lesson'];

  for (const n of [1, 2]) {
    const picked = await page.evaluate((k) => {
      const b = [...document.querySelectorAll('.tp-unit__b')][k - 1];
      if (!b) return false; b.click(); return true;
    }, n);
    if (!picked) { log('NO LESSON BUTTON ' + n); continue; }
    await page.waitForTimeout(900);
    for (const id of ids) {
      const pid = id + '@' + n;
      const hit = await page.evaluate((p) => {
        const el = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === p);
        if (!el) return null;
        (el.tagName === 'BUTTON' ? el : el.querySelector('button')).click();
        return true;
      }, pid);
      if (!hit) { log('NO CONTROL ' + pid); continue; }
      await page.waitForTimeout(350);
      const meta = await page.evaluate(() => {
        const p = document.querySelector('.tp-paper');
        if (!p) return null;
        return {
          title: (p.querySelector('.tp-paper__pack') || {}).innerText || '',
          unit: (p.querySelector('.tp-paper__unit') || {}).innerText || '(no unit line)',
          chars: p.innerText.length,
          h2: [...p.querySelectorAll('.tp-paper__h2')].map(x => x.innerText).slice(0, 12),
        };
      });
      const file = dir + '/' + pid.replace('@', '-L') + '.pdf';
      try { await page.pdf({ path: file, printBackground: true, preferCSSPageSize: true }); }
      catch (e) { log('PDF FAIL ' + pid + ' ' + e.message); }
      log('SHEET ' + pid + ' | ' + JSON.stringify(meta));
    }
  }
};
