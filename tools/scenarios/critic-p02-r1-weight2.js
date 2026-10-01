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
  // built-in population weight
  await page.evaluate(()=>window.__map.sizeByPopulation());
  await page.waitForTimeout(1400);
  await shot('weight-population');
  log('weight state', await page.evaluate(()=>{const w=window.__map.weight; return w?{metric:w.metric,counted:w.counted,missing:w.missing,caption:w.caption}:null;}));
  // ten-unit metric
  await page.evaluate(()=>{
    const ids = [...document.querySelectorAll('.map__target')].slice(0,10).map(e=>e.dataset.unit);
    const values = new Map(ids.map((id,i)=>[id, 1000*(i+1)]));
    window.__map.setWeight({metric:'test-ten', caption:'test', values, counted:0, missing:0});
    window.__TEN = ids;
  });
  await page.waitForTimeout(1200);
  await shot('weight-ten');
  log('ten weight', await page.evaluate(()=>{const w=window.__map.weight; return {counted:w.counted, missing:w.missing, ids:window.__TEN};}));
  // silence
  await page.evaluate(()=>window.__map.setWeight(null));
  await page.waitForTimeout(600);
  await page.evaluate(async ()=>{
    const b = await import('/app/js/core/bus.js');
    const bus = b.default && b.default.emit ? b.default : b;
    bus.emit('ask:paintSilence', {unitIds:['kenya','ke-kenya','malaya','my-malaya','cyprus'], reason:'records destroyed', agent:'the Colonial Office'});
  });
  await page.waitForTimeout(1200);
  await shot('silence');
  log('silences', await page.evaluate(()=>[...(window.__map.silences||new Map()).keys()]));
};
