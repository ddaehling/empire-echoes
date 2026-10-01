/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const probe = async (tag) => {
    const r = await page.evaluate(()=>{
      const sw=document.querySelector('.map__switch');
      const b=document.querySelector('.tl-rate__ask');
      const rc=b?b.getBoundingClientRect():null;
      const top = rc? document.elementFromPoint(rc.x+rc.width/2, rc.y+rc.height/2) : null;
      return { switchClass: sw?sw.className:'-', painted: sw? Math.round(sw.scrollHeight):0, box: sw?Math.round(sw.getBoundingClientRect().height):0,
        askBlockedBy: top? top.className : 'n/a' };
    });
    log(tag+': '+JSON.stringify(r));
  };
  await page.waitForTimeout(3000); await probe('t=3s');
  await page.waitForTimeout(8000); await probe('t=11s');
  await page.mouse.move(700, 200); await page.waitForTimeout(1000); await probe('after mouse over map');
  await page.click('.tl-btn--play'); await page.waitForTimeout(1500); await probe('after play');
  await page.click('.tl-btn--play').catch(()=>{}); await page.waitForTimeout(800); await probe('after pause');
  await shot('after');
};
