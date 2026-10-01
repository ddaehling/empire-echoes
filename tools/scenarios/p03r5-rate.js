/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'scrollIntoView').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1947'; });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const r = document.querySelector('.tl-rate');
    r.scrollIntoView();
  });
  const box = await page.evaluate(() => { const r = document.querySelector('.tl').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  log('tl box', JSON.stringify(box));
  await shot('01-rate-1947');
  await page.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp', 'zz.png') }).catch(()=>{});
  log('profile', JSON.stringify(await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    return { gained: p.profile.gained, lost: p.profile.lost, builtIn: p.profile.builtIn, shedIn: p.profile.shedIn,
             maxGain: p.profile.maxGain, maxLoss: p.profile.maxLoss, peak: p.profile.peak, rows: p.profile.rows.length,
             stops: [...p.stops.keys()].sort((a,b)=>a-b) };
  })));
  log('caption', await page.evaluate(() => document.querySelector('.tl-rate__caption').textContent));
};
