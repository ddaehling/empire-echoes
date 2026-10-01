/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const dossier = () => page.evaluate(() => {
    const el = document.querySelector('.dossier');
    if (!el) return null;
    const g = s => { const n = el.querySelector(s); return n ? n.innerText.trim() : null; };
    return {
      name: g('h2, .dsr__name, .dsr__title'),
      head: el.innerText.slice(0, 1400),
    };
  });
  for (const y of [1882, 1914, 1922, 1956, 1900, 1880]) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy + '&sel=egypt'; }, y);
    await page.waitForTimeout(900);
    const d = await dossier();
    log('==== YEAR ' + y + ' ====\n' + (d ? d.head : 'NO DOSSIER'));
    await shot('egypt-' + y);
  }
};
