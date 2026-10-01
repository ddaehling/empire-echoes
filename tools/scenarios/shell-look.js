/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=3', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2400);
  await shot('01-beat');
  log('bar: ' + await page.evaluate(() => {
    const b = document.querySelector('.app__bar');
    return [...b.querySelectorAll('button, a[href]')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
      .map(e=>{const r=e.getBoundingClientRect(); return (e.textContent||'').trim().replace(/\s+/g,' ').slice(0,20)+' '+Math.round(r.x)+'..'+Math.round(r.right);}).join(' | ');
  }));
  await page.evaluate(() => window.BEA.store.dispatch('select', 'kenya'));
  await page.waitForTimeout(1400);
  await shot('02-dossier');
};
