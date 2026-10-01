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
  for (const [hash, name] of [['#year=1857&sel=british-india', 'india'], ['#year=1964&sel=kenya', 'kenya'], ['#year=1700&sel=bermuda', 'bermuda']]) {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    await shot(name);
    const m = await page.evaluate(() => {
      const host = document.querySelector('.app__dossier');
      const root = document.querySelector('.dossier');
      const fold = root && root.querySelector('.dsr__fold');
      if (!host || !fold) return { none: true };
      return {
        over: Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom),
        h: host.clientHeight,
        fold: fold.innerText.replace(/\n+/g, ' | ').slice(0, 420),
      };
    });
    log(name + ': ' + JSON.stringify(m));
  }
  log('ERRORS ' + JSON.stringify(errs));
};
