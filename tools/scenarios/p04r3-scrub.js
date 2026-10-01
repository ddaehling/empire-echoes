/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Is the "a is not iterable" console failure P04's, or the shell's? */
module.exports = async ({ page, log }) => {
  const run = async (label, sel) => {
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto('http://localhost:8777/app/#year=1600' + (sel ? '&sel=' + sel : ''), { waitUntil: 'load' });
    await page.waitForTimeout(2200);
    errs.length = 0;
    await page.evaluate(async () => {
      const store = window.BEA.store;
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let y = 1600; y <= 1990; y += 5) { store.dispatch('setYear', y); await sleep(12); }
    });
    await page.waitForTimeout(800);
    log(label + ': ' + errs.length + ' uncaught page errors' + (errs.length ? ' — ' + errs[0] : ''));
    page.removeAllListeners('pageerror');
  };
  await run('scrub with NO dossier open   ', null);
  await run('scrub with the dossier OPEN  ', 'kenya');
};
