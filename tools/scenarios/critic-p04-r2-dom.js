/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  log(await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(n => {
      if (n.className && typeof n.className === 'string' && /dossier/i.test(n.className)) out.push(n.tagName + '.' + n.className.slice(0,80));
    });
    return 'DOSSIER-CLASSED (' + out.length + '):\n' + out.slice(0,25).join('\n');
  }));
  log(await page.evaluate(() => [...document.querySelectorAll('[data-slot]')].map(e=>e.dataset.slot + ' ' + e.tagName + ' ' + (e.className||'')).join('\n')));
};
