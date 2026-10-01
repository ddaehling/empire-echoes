/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Zero console errors, zero page errors, zero failed requests across a
   1600 -> 1997 scrub with a dossier open (P02 AT6 fires under our usage). */
module.exports = async ({ page, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1600&sel=british-india', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const t0 = Date.now();
  await page.evaluate(async () => {
    const { store } = window.BEA;
    for (let y = 1600; y <= 1997; y++) {
      store.dispatch('setYear', y);
      if (y % 7 === 0) await new Promise(r => requestAnimationFrame(r));
    }
    store.flush();
  });
  await page.waitForTimeout(1500);
  log('scrub 1600->1997 in ' + (Date.now() - t0) + 'ms');
  /* and again with a selection change every 40 years */
  await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const ids = data.territories.map(t => t.id);
    let i = 0;
    for (let y = 1600; y <= 1997; y += 1) {
      store.dispatch('setYear', y);
      if (y % 40 === 0) store.dispatch('select', ids[(i++ * 17) % ids.length]);
      if (y % 5 === 0) await new Promise(r => requestAnimationFrame(r));
    }
    store.flush();
  });
  await page.waitForTimeout(1500);
  log('ERRORS (' + errs.length + '): ' + JSON.stringify(errs.slice(0, 12)));
};
