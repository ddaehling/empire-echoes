/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  await shot('sheet');
  const m = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier');
    const fold = document.querySelector('.dsr__fold');
    return { over: Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom), h: host.clientHeight,
      fold: fold.innerText.replace(/\n+/g, ' | ').slice(0, 400) };
  });
  log(JSON.stringify(m));
  /* mount/destroy leak check */
  const leak = await page.evaluate(async () => {
    const before = document.querySelectorAll('.dossier').length;
    return { before, renderSource: typeof window.BEA.renderSource };
  });
  log('leak check ' + JSON.stringify(leak));
  log('ERRORS ' + JSON.stringify(errs));
};
