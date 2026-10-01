/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: fn is not a function.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Shared helper: neutralise the (currently broken, other-piece) shell grid so the
// dossier can be seen and driven. Records exactly what it changed.
module.exports.fixGrid = async (page, log) => {
  const before = await page.evaluate(() => getComputedStyle(document.querySelector('.app')).gridTemplateRows);
  await page.addStyleTag({ content: `
    .app { grid-template-rows: 56px minmax(0,1fr) 190px 30px !important;
           grid-template-columns: minmax(0,1fr) 432px !important; }
    .app__time { overflow: hidden !important; }
    .app__dossier { min-width: 432px !important; }
  `});
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => getComputedStyle(document.querySelector('.app')).gridTemplateRows);
  if (log) log('CRITIC OVERRIDE grid rows', before, '->', after);
};
