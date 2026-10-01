/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const d = await page.$('[data-slot="dossier"], #dossier, .dossier');
  log('dossier el present:', !!d);
  log('SLOTS: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-slot]')].map(e=>e.dataset.slot))));
  await shot('india-1913');
  const txt = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"]') || document.querySelector('.dossier');
    return el ? el.innerText : '(no dossier el)';
  });
  log('DOSSIER TEXT:\n' + txt.slice(0, 9000));
};
