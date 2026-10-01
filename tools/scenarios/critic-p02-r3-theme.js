/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(500); }
  await shot('theme');
  // sample canvas pixels for pure black/white fills
  const px = await page.evaluate(() => {
    const c = document.querySelector('.map__plate');
    const g = c.getContext('2d');
    const d = g.getImageData(0,0,c.width,c.height).data;
    const counts = new Map(); let black=0, white=0;
    for (let i=0;i<d.length;i+=4*7) {
      const k = d[i]+','+d[i+1]+','+d[i+2];
      counts.set(k,(counts.get(k)||0)+1);
      if (d[i]<6&&d[i+1]<6&&d[i+2]<6) black++;
      if (d[i]>250&&d[i+1]>250&&d[i+2]>250) white++;
    }
    const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,14);
    return { sampled: Math.floor(d.length/28), black, white, top };
  });
  log('pixels:', JSON.stringify(px));
  log('tokens:', await page.evaluate(()=>{ const s=getComputedStyle(document.documentElement);
    return ['--map-coast','--paper','--sea','--map-hover-stroke','--map-select-stroke'].map(k=>k+'='+s.getPropertyValue(k).trim()).join(' | '); }));
};
