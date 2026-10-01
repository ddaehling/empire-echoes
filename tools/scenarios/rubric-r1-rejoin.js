/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9',{waitUntil:'load'});
  await page.waitForTimeout(2200);
  await page.evaluate(()=>document.querySelector('.cmp__launch').click());
  await page.waitForTimeout(1600);
  const r1 = await page.evaluate(()=>({y:window.BEA.store.getState().year, step:window.BEA.store.getState().tourStep, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')}));
  log('IN COMPARE>>'+JSON.stringify(r1));
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].find(x=>/rejoin/i.test(x.textContent||''));
    if(b){b.click(); return b.textContent.trim();} return null;
  });
  log('clicked '+clicked);
  await page.waitForTimeout(1800);
  const r2 = await page.evaluate(()=>({y:window.BEA.store.getState().year, step:window.BEA.store.getState().tourStep, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' '), lede:(document.querySelector('[class*=lede],.cx-say')||{}).innerText.replace(/\s+/g,' ').slice(0,120)}));
  log('AFTER REJOIN>>'+JSON.stringify(r2));
  await shot('rejoined');
  // browser Back test
  await page.goBack(); await page.waitForTimeout(1200);
  const r3 = await page.evaluate(()=>({url:location.hash, y:window.BEA.store.getState().year, step:window.BEA.store.getState().tourStep, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')}));
  log('AFTER BACK>>'+JSON.stringify(r3));
  await shot('after-back');
};
