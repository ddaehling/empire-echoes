/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(2500);
  await shot('bengal-1765');
  const t = await page.evaluate(() => document.body.innerText);
  log('=== FULL TEXT ===');
  log(t);
  // measure the dossier element and whether it scrolls
  const info = await page.evaluate(() => {
    const cands = [...document.querySelectorAll('[class*=dossier],[id*=dossier],[data-slot=dossier]')];
    return cands.slice(0,6).map(e => ({ tag: e.tagName, cls: e.className.toString().slice(0,80), sh: e.scrollHeight, ch: e.clientHeight, rect: e.getBoundingClientRect().toJSON() }));
  });
  log('dossier elements:', JSON.stringify(info));
};
