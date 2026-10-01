/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* True printed page counts: build each pack and render the page to A4 PDF. */
const fs = require('fs');
module.exports = async ({ page, log, outDir }) => {
  await page.addInitScript(() => { window.print = () => {}; });
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 40000 });
  await page.waitForTimeout(3000);
  const packs = (process.env.TSURF_PACKS || 'board,plan,tasks-core,tasks-supported,tasks-extension,key,lesson').split(',');
  for (const id of packs) {
    await page.evaluate(() => { const o = document.querySelector('.tp-paper'); if (o) o.remove(); });
    const ok = await page.evaluate((pid) => {
      const host = document.querySelector('[data-pack="' + pid + '"]');
      let btn = host ? host.querySelector('button') : null;
      if (!btn) btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').toLowerCase().includes(pid));
      if (!btn) return false; btn.click(); return true;
    }, id);
    if (!ok) { log('PDF ' + id + ' — no button'); continue; }
    await page.waitForTimeout(600);
    const file = outDir + '/' + id + '.pdf';
    await page.pdf({ path: file, format: 'A4', printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '14mm', right: '14mm' } });
    const buf = fs.readFileSync(file);
    const n = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    log('PDF ' + id + ' -> ' + file + '  pages=' + n);
  }
};
