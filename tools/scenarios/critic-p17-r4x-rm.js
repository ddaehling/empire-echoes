/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  log('motion attr: ' + await page.evaluate(()=>document.documentElement.getAttribute('data-motion')));
  await shot('rm-default');
  // scrub hard
  for (let y=1600; y<=1997; y+=37) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  const g = await page.evaluate(()=>{const l=document.querySelector('.legend');return l&&l.innerText.slice(0,400);});
  log('after scrub: ' + g);
  await shot('rm-after');
};
