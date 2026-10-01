/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const step = process.env.STEP || '9';
  await page.goto('http://localhost:8777/app/#tour=thirty&step='+step, {waitUntil:'load'});
  await page.waitForTimeout(2500);
  await shot('beat'+step);
  const m = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {s, x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
    const map = r('.stage__map') || r('#map') || r('.map');
    // everything positioned fixed/absolute that overlaps the map
    const over = [];
    if (map) {
      document.querySelectorAll('*').forEach(e=>{
        const cs = getComputedStyle(e);
        if (cs.position!=='absolute' && cs.position!=='fixed') return;
        if (cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) return;
        const b = e.getBoundingClientRect();
        if (b.width<8||b.height<8) return;
        const ix = Math.max(0, Math.min(b.right,map.x+map.w)-Math.max(b.x,map.x));
        const iy = Math.max(0, Math.min(b.bottom,map.y+map.h)-Math.max(b.y,map.y));
        if (ix*iy>200) over.push({c:(e.className||'').toString().slice(0,50), area:Math.round(ix*iy), x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height), bg:cs.backgroundColor});
      });
    }
    over.sort((a,b)=>b.area-a.area);
    return {map, over: over.slice(0,14), docScroll: document.documentElement.scrollHeight - window.innerHeight,
      clozeText: (document.querySelector('[class*="cloze"], .thruline, [class*="thru"]')||{}).innerText || 'NONE',
      body: document.body.innerText.slice(0,1200)};
  });
  log(JSON.stringify(m.map));
  log('mapArea', m.map ? m.map.w*m.map.h : 0);
  log('overlaps:'); m.over.forEach(o=>log('  '+JSON.stringify(o)));
  log('docScrollOver', m.docScroll);
  log('CLOZE:', m.clozeText);
  log('BODY:', m.body);
};
