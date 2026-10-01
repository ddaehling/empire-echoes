/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const c = document.querySelector('.map__plate');
    const ctx = c.getContext('2d');
    const dpr = c.width / parseFloat(c.style.width);
    const img = ctx.getImageData(0,0,c.width,c.height).data;
    const counts = new Map();
    for (let i=0;i<img.length;i+=4){
      if (img[i+3] < 200) continue;
      const k = img[i]+','+img[i+1]+','+img[i+2];
      counts.set(k,(counts.get(k)||0)+1);
    }
    const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,25);
    const pureBlack = counts.get('0,0,0')||0, pureWhite = counts.get('255,255,255')||0;
    return { dpr, w:c.width, h:c.height, distinct: counts.size, top, pureBlack, pureWhite, total: c.width*c.height };
  });
  log(JSON.stringify(r, null, 1).slice(0, 4000));
};
