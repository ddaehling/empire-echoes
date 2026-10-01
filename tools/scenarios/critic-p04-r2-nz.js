/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const t = await page.evaluate(() => document.querySelector('.dossier').innerText);
  log('NZ FULL (' + t.length + ' chars):\n' + t.slice(0, 7000));
  log('--- housestyle footer ---');
  log(await page.evaluate(()=>{const n=document.querySelector('.dsr__stylefoot, [class*=stylefoot], [class*=housenote]'); return n?n.innerText:'(none found)';}));
};
