/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const measure = async (tag) => {
    const m = await page.evaluate(() => {
      const r = e => { if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
      const map = document.querySelector('.stage__map') || document.querySelector('.map');
      const mb = map && map.getBoundingClientRect();
      const floats = [];
      if (mb) {
        document.querySelectorAll('body *').forEach(e=>{
          const cs = getComputedStyle(e);
          if (cs.position!=='fixed' && cs.position!=='absolute') return;
          if (cs.visibility==='hidden'||cs.display==='none'||cs.opacity==='0') return;
          const b = e.getBoundingClientRect();
          if (b.width<20||b.height<12) return;
          const ox = Math.max(0, Math.min(b.right,mb.right)-Math.max(b.left,mb.left));
          const oy = Math.max(0, Math.min(b.bottom,mb.bottom)-Math.max(b.top,mb.top));
          if (ox*oy > 400) {
            // ignore elements that contain the map
            if (e.contains(map)) return;
            floats.push({cls:(e.className||'').toString().slice(0,44), w:Math.round(b.width),h:Math.round(b.height), ov:Math.round(ox*oy)});
          }
        });
      }
      floats.sort((a,b)=>b.ov-a.ov);
      const mapArea = mb ? mb.width*mb.height : 0;
      // dedupe nested
      return { map: r(map), mapArea: Math.round(mapArea), floats: floats.slice(0,12),
        totalPct: mapArea? +(floats.reduce((s,f)=>s+f.ov,0)/mapArea*100).toFixed(1):0,
        topPct: mapArea && floats[0] ? +(floats[0].ov/mapArea*100).toFixed(1) : 0,
        docW: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight };
    });
    log(tag + ' >> ' + JSON.stringify(m));
  };
  await page.waitForTimeout(2500);
  await measure('COLD');
  await shot('cold');
  await page.click('.cx-cta');
  await page.waitForTimeout(1500);
  await measure('BEAT1');
  await shot('beat1');
  // advance a few
  for (let i=0;i<3;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();}); await page.waitForTimeout(800); }
  await measure('BEAT4');
  await shot('beat4');
  // cloze visible?
  const cloze = await page.evaluate(()=>{
    const e=[...document.querySelectorAll('*')].filter(x=>/It started as/.test(x.textContent||'') && x.children.length<25).pop();
    if(!e) return 'NOT FOUND';
    const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    return {txt:e.innerText.replace(/\s+/g,' ').slice(0,300), rect:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)], disp:cs.display, vis:cs.visibility};
  });
  log('CLOZE >> ' + JSON.stringify(cloze));
  // panel text truncation check
  await shot('beat4b');
};
