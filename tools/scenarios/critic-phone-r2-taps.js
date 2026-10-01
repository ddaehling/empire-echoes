/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1200);
  const r = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('button,a[href],[role="button"],input,select,summary').forEach(e=>{
      const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      if(cs.visibility==='hidden'||cs.display==='none') return;
      if(b.width===0||b.height===0) return;
      if(b.top<0||b.bottom>innerHeight||b.left<0||b.right>innerWidth) return; // only on-screen
      const w=Math.round(b.width),h=Math.round(b.height);
      if(w<24||h<24) out.push({t:(e.textContent||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,36), w,h, cls:(e.className||'').toString().slice(0,28)});
    });
    const all=[...document.querySelectorAll('button,a[href],[role="button"]')].filter(e=>{const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return cs.display!=='none'&&b.width>0&&b.top>=0&&b.bottom<=innerHeight&&b.left>=0&&b.right<=innerWidth;});
    const under44=all.filter(e=>{const b=e.getBoundingClientRect();return b.width<44||b.height<44;}).length;
    return {failWCAG24:out, onScreen:all.length, under44};
  });
  log('on-screen controls: '+r.onScreen+'  under 44x44: '+r.under44+'  BELOW WCAG 2.2 24x24 minimum: '+r.failWCAG24.length);
  log(JSON.stringify(r.failWCAG24,null,1));
};
