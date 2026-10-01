/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1600);
  const k = await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>/full key/i.test(b.innerText)); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  if (k) await page.mouse.click(k.x, k.y);
  await page.waitForTimeout(1500);
  await shot('plate-open');
  log(JSON.stringify(await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    const axis = document.querySelector('.tl__axis') || document.querySelector('[class*="tl__rail"]') || document.querySelector('.tl__ticks');
    const out = { axisSel: axis && axis.className, axis: axis && R(axis) };
    // any element overlapping the axis rect that is not a descendant/ancestor
    if (axis) {
      const a = axis.getBoundingClientRect();
      out.over = [...document.querySelectorAll('div,p,section,button,h1,h2,span')].filter(e => {
        if (!e.offsetParent) return false;
        if (e.contains(axis) || axis.contains(e)) return false;
        const b = e.getBoundingClientRect();
        if (b.width < 80 || b.height < 12) return false;
        if (!(b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top)) return false;
        return (e.innerText||'').trim().length > 4;
      }).slice(0,10).map(e => (typeof e.className==='string'?e.className:e.tagName).slice(0,40)+' '+JSON.stringify(R(e))+' :: '+(e.innerText||'').replace(/\s+/g,' ').slice(0,60));
    }
    out.plate = (()=>{const e=document.getElementById('legend-plate'); return e && R(e);})();
    out.tl = (()=>{const e=document.querySelector('#timebar'); return e && R(e);})();
    out.stage = (()=>{const e=document.querySelector('.app__stage'); return e && R(e);})();
    // spine labels truncated?
    out.spineTrunc = [...document.querySelectorAll('[class*=spine] button, [class*=phase]')].filter(e=>e.offsetParent && e.scrollWidth-e.clientWidth>2).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,40)+` cw=${e.clientWidth} sw=${e.scrollWidth}`);
    return out;
  }), null, 1));
};
