/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3500);
  const r = await page.evaluate(()=>{
    const out=[];
    for (const sel of ['.map__proj','.map__stitch','.map__weight','.map__silence','.map__zoom','.map__more','.map__controls']) {
      const n=document.querySelector(sel);
      if(!n){out.push([sel,'MISSING']);continue;}
      const b=n.getBoundingClientRect(); const cs=getComputedStyle(n);
      out.push([sel, Math.round(b.x)+','+Math.round(b.y)+' '+Math.round(b.width)+'x'+Math.round(b.height), cs.display, cs.visibility, cs.opacity]);
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
  // scroll map into view and screenshot the controls area
  await page.evaluate(()=>document.querySelector('.map__controls')?.scrollIntoView());
  await shot('mob-controls');
};
