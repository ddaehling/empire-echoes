/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('view');
  log('theme', await page.evaluate(()=>document.documentElement.getAttribute('data-theme')+'|'+document.documentElement.getAttribute('data-motion')));
  // sample plate pixels for pure black/white
  const px = await page.evaluate(()=>{
    const c = document.querySelector('.map__plate');
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0,0,c.width,c.height).data;
    const counts = {black:0, white:0, total:0};
    for (let i=0;i<d.length;i+=4*97){ counts.total++;
      const r=d[i],g=d[i+1],b=d[i+2];
      if(r===0&&g===0&&b===0) counts.black++;
      if(r===255&&g===255&&b===255) counts.white++; }
    return counts;
  });
  log('PIXELS', JSON.stringify(px));
};
