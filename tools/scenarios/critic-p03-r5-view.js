/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{location.hash='#year=1947';}); await page.waitForTimeout(900);
  await shot('view');
  const g = await page.evaluate(()=>{
    const q = s => { const e=document.querySelector(s); return e? Math.round(e.getBoundingClientRect().y)+','+Math.round(e.getBoundingClientRect().height)+' w'+Math.round(e.getBoundingClientRect().width) : 'absent'; };
    return { stage:q('#stage'), timebar:q('#timebar'), spine:q('.tl-spine'), rate:q('.tl-rate'), axis:q('.tl-ax__rail'), row:q('.tl__changerow'),
      spineText: (document.querySelector('.tl-spine')||{innerText:''}).innerText.slice(0,400),
      vh: innerHeight, vw: innerWidth, scrollH: document.documentElement.scrollHeight };
  });
  log(JSON.stringify(g,null,1));
};
