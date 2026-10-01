/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  log('motion attr: ' + await page.evaluate(()=>document.documentElement.dataset.motion || document.body.dataset.motion || 'none'));
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  const samples = [];
  await page.keyboard.press('p');
  for (let i=0;i<10;i++){
    await page.waitForTimeout(120);
    const s = await page.evaluate(() => { const m = window.__map; return { proj: m.projection, morph: m.module && null, fade: (()=>{const f=document.querySelector('.map__fade'); return f? getComputedStyle(f).opacity : null;})() }; });
    samples.push(JSON.stringify(s));
  }
  log('samples: ' + samples.join(' '));
  await page.waitForTimeout(2000);
  await shot('rm-after');
  log('final proj: ' + await page.evaluate(()=>window.__map.projection));
};
