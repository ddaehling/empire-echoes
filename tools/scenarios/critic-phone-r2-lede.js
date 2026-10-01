/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(800);
  const probe = async (tag) => {
    const r = await page.evaluate(()=>{
      const out=[];
      document.querySelectorAll('.app__lede *').forEach(e=>{
        const cs=getComputedStyle(e);
        const clamped = cs.webkitLineClamp && cs.webkitLineClamp!=='none';
        if (e.scrollHeight>e.clientHeight+1 || e.scrollWidth>e.clientWidth+1)
          out.push({tag:e.tagName, cls:(e.className||'').toString().slice(0,36), clamp:cs.webkitLineClamp, sh:e.scrollHeight, ch:e.clientHeight, sw:e.scrollWidth, cw:e.clientWidth, t:(e.textContent||'').trim().slice(0,70)});
      });
      const lede=document.querySelector('.app__lede');
      return {out, h: lede?Math.round(lede.getBoundingClientRect().height):null};
    });
    log(tag+' ledeH='+r.h+' clipped='+JSON.stringify(r.out));
  };
  for (const y of [1900,2020,1780,1857,1947]) {
    await page.evaluate(yy=>window.BEA.store.dispatch('setYear',yy), y);
    await page.waitForTimeout(900);
    await probe('year '+y);
  }
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',2020));
  await page.waitForTimeout(900);
  await shot('lede2020','.app__lede');
};
