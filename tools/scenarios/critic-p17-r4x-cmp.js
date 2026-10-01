/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(()=>{location.hash='#year=1914&compare=1830';});
  await page.waitForTimeout(2200);
  await shot('compare');
  const t = await page.evaluate(()=>{
    const by=document.querySelector('.byline'), leg=document.querySelector('.legend');
    return { by: by&&by.innerText, leg: leg&&leg.innerText, hash: location.hash };
  });
  log(JSON.stringify(t, null, 1));
};
