/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out = '/tmp/cp02r4-crop2';
  require('fs').mkdirSync(out,{recursive:true});
  await page.screenshot({path: path.join(out,'india.png'), clip:{x:740,y:90,width:200,height:170}});
  // position of India units
  const p = await page.evaluate(() => {
    const ids=['in-rajputana','in-bengal','india','in-bombay','in-madras','in-punjab','in-united-provinces'];
    const t=[...document.querySelectorAll('.map__target')];
    const found = t.filter(x=>/^in-|^india/.test(x.dataset.unit)).slice(0,15).map(x=>{const r=x.getBoundingClientRect();return{id:x.dataset.unit,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
    return found;
  });
  log('INDIA TARGETS:', JSON.stringify(p));
};
