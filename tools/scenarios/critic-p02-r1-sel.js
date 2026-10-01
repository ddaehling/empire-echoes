/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const h of ['#year=1913&sel=ascension','#year=1913&sel=bengal-presidency','#year=1765&sel=bengal']) {
    await page.goto('http://localhost:8777/app/'+h, {waitUntil:'load'});
    await page.waitForTimeout(2800);
    const s = await page.evaluate(()=>({hash:location.hash, sel:[...document.querySelectorAll('[aria-selected=true]')].map(e=>e.dataset.unit)}));
    log(h, '->', JSON.stringify(s));
    await shot('sel'+h.replace(/[^\w]/g,'_'));
  }
  // silence full text
  await page.goto('http://localhost:8777/app/#year=1913',{waitUntil:'load'}); await page.waitForTimeout(3000);
  await page.evaluate(async ()=>{ const b=await import('/app/js/core/bus.js'); const bus=b.default&&b.default.emit?b.default:b; bus.emit('ask:paintSilence',{unitIds:['kenya','zzz-fake','also-fake','nope4','nope5'],reason:'r',agent:'a'}); });
  await page.waitForTimeout(900);
  log('silence full', await page.evaluate(()=>{const els=[...document.querySelectorAll('.map__caveat')]; return els.map(e=>e.innerText).join(' || ');}));
};
