/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  for (const y of [1200,1500,1583,2026,3000]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(900);
    const t = await page.evaluate(()=>({y:window.BEA.store.getState().year,
      fig:(document.querySelector('.legend__figures')||{innerText:'(none)'}).innerText,
      abs:(document.querySelector('.legend__absent')||{innerText:''}).innerText.slice(0,120),
      by:(document.querySelector('#legend-byline .byline__line')||{innerText:''}).innerText.replace(/\n/g,' ').slice(0,150)}));
    log(y+' -> '+JSON.stringify(t));
  }
  await shot('edge');
  // rapid definition mashing
  for (let i=0;i<20;i++){ await page.keyboard.press(String(1+(i%4))); }
  await page.waitForTimeout(1200);
  log('after mash: '+ await page.evaluate(()=>(document.querySelector('.legend__figures')||{innerText:''}).innerText));
  // typing into a text field should not steal 1-4
  const q = await page.locator('input[type="search"], input[type="text"]').count();
  log('text inputs: '+q);
};
