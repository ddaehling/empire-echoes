/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.type()+': '+m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.waitForTimeout(2000);
  const go = async (hash, name) => {
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForTimeout(1200);
    await shot(name);
    const txt = await page.evaluate(() => {
      const d = document.querySelector('.app__dossier') || document.querySelector('[data-slot=dossier]');
      return d ? d.innerText : '(NO DOSSIER SLOT FOUND) body:' + document.body.innerText.slice(0,400);
    });
    log('=== ' + hash + ' ===\n' + txt);
  };
  await go('#year=1913&sel=bengal-presidency', '02-bengal');
  log('CONSOLE ERRORS: ' + JSON.stringify(errs));
};
