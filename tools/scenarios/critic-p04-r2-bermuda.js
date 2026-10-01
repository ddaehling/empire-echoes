/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  const t = await page.evaluate(() => document.querySelector('.dossier').innerText);
  const i = t.indexOf('WHO WAS HERE');
  log('BERMUDA WHO WAS HERE:\n' + t.slice(i, i + 900));
  log('--- defects: ' + await page.evaluate(() => [...document.querySelectorAll('.defect')].map(n=>n.textContent).join(' | ')));
  // now a nonexistent territory
  await page.evaluate(() => { location.hash = '#year=1900&sel=not-a-place'; });
  await page.waitForTimeout(700);
  log('EMPTY PANEL:\n' + await page.evaluate(() => { const e=document.querySelector('.dossier'); return e?e.innerText:'(no panel)'; }));
  await shot('empty-panel');
};
