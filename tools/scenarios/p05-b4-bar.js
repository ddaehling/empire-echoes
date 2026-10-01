/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  // finish so the "One more, off this map" aux appears
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const a = document.querySelector('.tr-bar__aux');
    const clipped = [...document.querySelectorAll('.app__bar button, .app__bar a, .app__bar span')]
      .filter(n => n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0)
      .map(n => (n.className || '') + ' "' + (n.textContent || '').trim().slice(0, 26) + '" ' + n.clientWidth + '/' + n.scrollWidth);
    return { aux: a ? getComputedStyle(a).display : 'none-el', auxText: a ? (a.textContent || '').trim() : '', clipped, bar: (document.querySelector('.app__bar') || {}).textContent };
  });
  log(JSON.stringify(r, null, 1));
  await shot('bar');
};
