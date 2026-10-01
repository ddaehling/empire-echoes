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
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  const go = async (hash, name) => {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await page.waitForTimeout(1800);
    await shot(name);
    const info = await page.evaluate(() => {
      const root = document.querySelector('.dossier');
      const host = document.querySelector('.app__dossier');
      if (!root) return { none: true };
      const fold = root.querySelector('.dsr__fold');
      const hb = host ? host.getBoundingClientRect() : null;
      const fb = fold ? fold.getBoundingClientRect() : null;
      return {
        fold: fold ? fold.innerText : '(no fold)',
        overflow: hb && fb ? Math.round(fb.bottom - hb.bottom) : null,
        scrollH: host ? host.scrollHeight : null,
        clientH: host ? host.clientHeight : null,
        words: root.innerText.split(/\s+/).filter(Boolean).length,
        tabstops: root.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])').length,
      };
    });
    log('### ' + name + '  overflow=' + info.overflow + '  scrollH=' + info.scrollH + '/' + info.clientH + '  words=' + info.words + '  tabstops=' + info.tabstops);
    log(info.fold);
    log('');
  };
  await go('#year=1964&sel=kenya', 'kenya-1964');
  await go('#year=1857&sel=british-india', 'india-1857');
  await go('#year=1857&sel=bengal-presidency', 'bengal-1857');
  await go('#year=1882&sel=egypt', 'egypt-1882');
  await go('#year=1700&sel=bermuda', 'bermuda-1700');
  log('ERRORS: ' + JSON.stringify(errs));
};
