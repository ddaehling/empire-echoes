/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const st = await page.evaluate(async ()=>{
    const s = await import('/app/js/core/store.js');
    const store = s.default || s.store || s;
    const g = store.get ? store.get() : (store.state||null);
    return { keys: Object.keys(s), state: g ? Object.keys(g) : null, layer: g?g.layer:null };
  });
  log('STORE '+JSON.stringify(st));
  // find layer UI controls
  const ui = await page.evaluate(()=>{
    const out=[];
    for(const e of document.querySelectorAll('button,[role="radio"],select,option,a')){
      const t=(e.innerText||e.value||'').replace(/\s+/g,' ').trim();
      if(/tenure|mechanism|how it left|informal|network|stitch|pressure|layer/i.test(t) && t.length<60){const r=e.getBoundingClientRect();out.push({t,c:(e.className||'').toString().slice(0,40),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)});}
    }
    return out.slice(0,25);
  });
  log('LAYER UI '+JSON.stringify(ui,null,1));
};
