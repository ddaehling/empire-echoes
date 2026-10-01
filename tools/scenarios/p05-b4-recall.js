/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=7', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const m = () => page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const b = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    const body = q('.cx-sheet__body');
    return { read: document.getElementById('app').dataset.read, fit: document.documentElement.getAttribute('data-tour-fit'),
      map: b('.stage__map'), body: body ? [body.clientHeight, body.scrollHeight] : null, foot: b('.tr-foot'),
      fitBtn: (() => { const x = q('.tr-panel__fit') || q('.cx-sheet__fit'); return x ? (x.className.split(' ')[0] + ':' + (x.textContent||'').trim() + '/hidden=' + x.hidden) : null; })() };
  });
  log('recall, first paint ' + JSON.stringify(await m()));
  await shot('recall-text');
  await page.evaluate(() => (document.querySelector('.tr-panel__fit') || document.querySelector('.cx-sheet__fit')).click());
  await page.waitForTimeout(600);
  log('after MAP           ' + JSON.stringify(await m()));
  await shot('recall-map');
  await page.evaluate(() => (document.querySelector('.tr-panel__fit') || document.querySelector('.cx-sheet__fit')).click());
  await page.waitForTimeout(600);
  log('back to text        ' + JSON.stringify(await m()));
};
