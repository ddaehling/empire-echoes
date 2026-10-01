/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=5', {waitUntil:'load'});
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(e=>{
      if (e.scrollHeight > e.clientHeight + 8 && e.clientHeight > 40) {
        const cs=getComputedStyle(e);
        if (cs.overflowY==='auto'||cs.overflowY==='scroll') {
          const b=e.getBoundingClientRect();
          out.push({cls:(e.className||'').toString().slice(0,50), ch:e.clientHeight, sh:e.scrollHeight, y:Math.round(b.y), h:Math.round(b.height)});
        }
      }
    });
    return out;
  });
  log('SCROLLERS', JSON.stringify(info));
  await shot('gate-top');
  // scroll the beat panel body
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(e=>{
      if (e.scrollHeight > e.clientHeight + 8 && e.clientHeight > 40) {
        const cs=getComputedStyle(e);
        if (cs.overflowY==='auto'||cs.overflowY==='scroll') e.scrollTop = 400;
      }
    });
  });
  await page.waitForTimeout(400);
  await shot('gate-scrolled');
  const t = await page.evaluate(()=>document.body.innerText);
  log('TEXT', t.slice(0,3000));
  // buttons visible
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>({t:(b.textContent||'').trim().replace(/\s+/g,' ').slice(0,50), r:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(b.getBoundingClientRect()), dis:b.disabled})));
  log('BUTTONS', JSON.stringify(btns,null,0));
};
