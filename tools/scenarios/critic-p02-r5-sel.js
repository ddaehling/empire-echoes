/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  for (const [y, id] of [[1913,'in-bengal-presidency'],[1913,'ie-ireland'],[1857,'in-bengal-presidency'],[1770,'barbados']]) {
    await page.evaluate(([y,id]) => { location.hash = `#year=${y}&sel=${id}`; }, [y,id]);
    await page.waitForTimeout(1500);
    const sel = await page.evaluate(()=>({hash:location.hash, selected: (document.querySelector('.map__target[aria-selected="true"]')||{}).dataset }));
    log(y+' '+id+' -> '+JSON.stringify(sel));
  }
  // pick by clicking Bengal region
  await page.evaluate(() => { location.hash = '#year=1913'; }); await page.waitForTimeout(1200);
  const el = await page.$('[data-unit="in-bengal-presidency"]');
  if (el) { const b = await el.boundingBox(); await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(1200); await shot('hover-bengal');
    await page.mouse.click(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(1800); await shot('click-bengal');
    log('READOUT: ' + await page.evaluate(()=>{const e=document.querySelector('.map__readout,.map__card,.map__hover'); return e?e.innerText:'(none)';}));
    log('HASH: ' + await page.evaluate(()=>location.hash));
  } else log('no bengal target');
};
