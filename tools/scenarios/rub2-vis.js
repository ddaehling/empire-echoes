/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', {waitUntil:'load'});
  await page.waitForTimeout(2200);
  const r = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('button').forEach(e=>{
      const t=(e.innerText||'').replace(/\s+/g,' ').slice(0,45);
      if(/crowd was penned|deliberate deterrence|Show me what they wrote|Neither on its own/.test(t)){
        const b=e.getBoundingClientRect(); out.push({t, y:Math.round(b.y), h:Math.round(b.height), inView: b.y>0&&b.bottom<innerHeight});
      }
    });
    const p=document.querySelector('.tr-panel'); const pb=p.getBoundingClientRect();
    const scrollers=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+10&&e.clientHeight>40).map(e=>({c:(e.className||'').toString().slice(0,40),ch:e.clientHeight,sh:e.scrollHeight}));
    return {panel:{y:Math.round(pb.y),h:Math.round(pb.height)}, out, scrollers: scrollers.slice(0,10), vh: innerHeight};
  });
  log(JSON.stringify(r,null,1));
};
