/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const spine = async (label) => {
    const s = await page.evaluate(() => {
      const el = document.querySelector('.tl-spine');
      if (!el) return { present:false };
      const r = el.getBoundingClientRect();
      return { present:true, w:r.width, h:r.height, vis: r.height>0 && r.width>0, txt: el.innerText.slice(0,300) };
    });
    log(label, JSON.stringify(s));
  };
  await spine('default:');
  // compare mode
  await page.evaluate(() => window.BEA.store.dispatch('toggleCompare'));
  await page.waitForTimeout(900); await spine('compare:'); await shot('compare');
  await page.evaluate(() => window.BEA.store.dispatch('toggleCompare'));
  // tour
  const tours = await page.evaluate(() => (window.BEA.data.tours||[]).map(t=>t.id).slice(0,5));
  log('tours:', JSON.stringify(tours));
  if (tours[0]) { await page.evaluate((id) => window.BEA.store.dispatch('startTour', {id, step:0}), tours[0]); await page.waitForTimeout(1400); await spine('tour:'); await shot('tour'); }
  // quiz
  await page.evaluate(() => window.BEA.store.dispatch('endTour'));
  await page.waitForTimeout(400);
  // close panel
  await page.evaluate(() => window.BEA.store.dispatch('setPanel', {overlay:'close'}));
  await page.waitForTimeout(1200); await spine('close-overlay:'); await shot('close');
  log('hash:', await page.evaluate(()=>location.hash));
};
