/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{location.hash='#year=1620';});
  await page.waitForTimeout(1800);
  await page.keyboard.press('s'); await page.waitForTimeout(1600);
  const g = await page.evaluate(()=>{
    const by=document.querySelector('.byline'), leg=document.querySelector('.legend');
    return { by: by&&by.innerText, leg: leg&&leg.innerText };
  });
  log('AT 1620 fresh stitch:\n' + g.by + '\n---\n' + g.leg);
  await shot('s1620');
};
