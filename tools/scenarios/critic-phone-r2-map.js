/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const meas = async (tag)=>{
    const r = await page.evaluate(()=>{
      const q=s=>{const e=document.querySelector(s); if(!e)return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)};};
      const m=q('.map__frame')||q('.stage__map');
      const cv=document.querySelector('.map__plate');
      return {map:m, plate:cv?{w:Math.round(cv.getBoundingClientRect().width),h:Math.round(cv.getBoundingClientRect().height)}:null,
        vw:innerWidth, vh:innerHeight, pct: m? Math.round(1000*m.w*m.h/(innerWidth*innerHeight))/10 : null,
        time:q('.app__time'), lede:q('.app__lede'), bar:q('.app__bar'), key:q('.app__key'),
        panel:q('.tr-panel__scroll')};
    });
    log(tag+': '+JSON.stringify(r));
  };
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1000);
  await meas('COLD');
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1300);
  await meas('BEAT9');
  await shot('beat9');
};
