/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const states = [
    '#year=1913',
    '#year=1913&layer=tenure',
    '#year=1913&layer=informal',
    '#year=1913&layer=mechanism',
    '#year=1820&compare=1770',
    '#year=1913&panel=evidence',
    '#year=1913&panel=methods',
    '#year=1765&tour=company-rule&step=3',
    '#year=1913&quiz=core',
  ];
  await page.goto('http://localhost:8777/app/'+states[0], {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  for (const s of states) {
    await page.evaluate(h=>{location.hash=h;}, s);
    await page.waitForTimeout(1600);
    const r = await page.evaluate(()=>{
      const b=document.querySelector('#legend-byline');
      const L=document.querySelector('[data-mount="legend"] .legend');
      const vis = e => { if(!e) return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
      return { byline: b? b.innerText.replace(/\n+/g,' | ').slice(0,220):'MISSING', bylineVisible: vis(b),
               legendVisible: vis(L), legendFirst: L? L.innerText.split('\n').slice(0,4).join(' / '):'MISSING' };
    });
    log(s + '\n   byline: ' + r.byline + '\n   bylineVisible=' + r.bylineVisible + ' legendVisible=' + r.legendVisible + ' legend: ' + r.legendFirst);
  }
  // weight mode via the bus
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>window.BEA.bus.emit('ask:sizeBy',{metric:'population', caption:'test'}));
  await page.waitForTimeout(1200);
  const w = await page.evaluate(()=>{ const b=document.querySelector('.byline__crit'); b.click(); return null; });
  await page.waitForTimeout(700);
  log('WEIGHT MODE byline+crit:\n' + await page.evaluate(()=>document.querySelector('#legend-byline').innerText));
  await shot('weight');
};
