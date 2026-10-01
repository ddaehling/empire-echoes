/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  const st = () => page.evaluate(() => {
    const a = document.getElementById('app');
    const m = document.querySelector('.stage__map');
    const s = document.querySelector('.tr-panel__scroll') || document.querySelector('.cx-sheet__body');
    return { read: a.dataset.read, path: a.dataset.path, rail: a.dataset.rail,
      map: m ? Math.round(m.getBoundingClientRect().height) : 0,
      readable: s ? Math.round(s.getBoundingClientRect().height) + '/' + s.scrollHeight : 'none',
      doc: document.documentElement.scrollHeight + '/' + innerHeight };
  });
  await page.goto('http://localhost:8777/app/#tour=thirty&step=18', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2000);
  log('start 390:    ' + JSON.stringify(await st()));
  for (const [w, h] of [[1366, 768], [390, 844], [768, 1024], [900, 700], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1100);
    log('  resized ' + w + 'x' + h + ': ' + JSON.stringify(await st()));
  }
  await shot('after-resizes');
};
