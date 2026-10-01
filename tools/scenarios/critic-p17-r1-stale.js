/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'replace').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(400);
  const state = () => page.evaluate(()=>({ layer: window.BEA.store.getState().activeLayer, hash: location.hash,
    byline: (document.querySelector('#legend-byline .byline__line')||{}).innerText.replace(/\n/g,' ').slice(0,160) }));
  log('A fresh: '+JSON.stringify(await state()));
  await shot('A-status');
  await page.evaluate(()=>{location.hash='#year=1913&layer=mechanism';});
  await page.waitForTimeout(1600);
  log('B mechanism: '+JSON.stringify(await state()));
  await shot('B-mechanism');
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(1600);
  log('C back to default hash: '+JSON.stringify(await state()));
  await shot('C-back');
};
