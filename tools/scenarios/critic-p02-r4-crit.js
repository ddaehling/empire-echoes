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
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1860));
  await page.keyboard.press('4'); await page.waitForTimeout(1200);
  const inf = await page.evaluate(()=>{ const m=window.BEA.data.statusAt(1860); const out=[]; m.forEach((v,k)=>{ if(v.status==='informal-sphere') out.push(k); }); return out; });
  log('INFORMAL 1860:', JSON.stringify(inf));
  const pos = await page.evaluate(()=>{ const m=window.BEA.data.statusAt(1860); const out=[]; m.forEach((v,k)=>{ if(v.status==='informal-sphere'){ const e=document.querySelector(`.map__target[data-unit="${k}"]`); const r=e&&e.getBoundingClientRect(); out.push({k, drawn: !!e, x:r&&Math.round(r.x), y:r&&Math.round(r.y)});} }); return out;});
  log('INFORMAL DRAWN:', JSON.stringify(pos));
  const out='/tmp/cp02r4-crit'; require('fs').mkdirSync(out,{recursive:true});
  await page.screenshot({path: path.join(out,'informal.png'), clip:{x:520,y:60,width:560,height:340}});
  // criticism panel
  const b = await page.$('text=Three things wrong with this rendering');
  if (b) { await b.click(); await page.waitForTimeout(1200); await shot('criticism');
    log('CRIT TEXT:', (await page.evaluate(()=>{const d=[...document.querySelectorAll('div,section,aside')].map(e=>e.innerText).filter(t=>t&&/wrong with this rendering|projection/i.test(t)); return d[d.length-1]||'';})).slice(0,3000)); }
};
