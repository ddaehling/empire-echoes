/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(900);
  await shot('m1858');
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(900);
  await shot('m1900');
  const h = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('.time__slot *').forEach(e=>{const r=e.getBoundingClientRect(); if(r.height>60 && e.children.length<3) out.push(e.className+' h='+Math.round(r.height)+' text='+(e.textContent||'').slice(0,40));});
    return out.slice(0,25);
  });
  log(JSON.stringify(h,null,1));
};
