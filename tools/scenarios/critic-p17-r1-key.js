/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', {waitUntil:'load'});
  await page.waitForTimeout(1000);
  await page.evaluate(()=>{ location.hash='#year=1913'; });
  await page.waitForTimeout(2500);
  // force layout sanity
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(500);
  // expand legend area artificially so full key can be shot
  await page.addStyleTag({content:'.stage__legend{max-height:none !important; inset-block-end:auto !important; inset-block-start:0 !important;} .legend{max-block-size:none !important;}'});
  await page.waitForTimeout(600);
  await shot('key-full', '[data-mount="legend"]');
  const t = await page.evaluate(()=>document.querySelector('[data-mount="legend"]').innerText);
  log('FULL LEGEND TEXT:\n'+t);
  // swatch inspection
  const sw = await page.evaluate(()=>{
    return [...document.querySelectorAll('.legend__entry')].map(b=>{
      const s=b.querySelector('[class*=swatch]');
      const cs=s?getComputedStyle(s):null;
      return { word:(b.querySelector('.legend__word')||{}).innerText, bg:cs&&cs.backgroundColor, bgImg:cs&&(cs.backgroundImage||'').slice(0,60), hasSvg: !!(s&&s.querySelector('svg')), swHTML: s?s.outerHTML.slice(0,200):null };
    });
  });
  log('SWATCHES:\n'+JSON.stringify(sw,null,1).slice(0,4000));
};
