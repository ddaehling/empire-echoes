module.exports = async ({ page, shot, log }) => {
  const measure = async (tag) => {
    const m = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
      const map = r('.stage__map') || r('[class*="stage__map"]') || r('svg');
      const floats = [...document.querySelectorAll('body *')].filter(e => {
        const cs = getComputedStyle(e); if (cs.position !== 'absolute' && cs.position !== 'fixed') return false;
        const b = e.getBoundingClientRect(); if (b.width < 24 || b.height < 24) return false;
        if (e.closest('[hidden]')) return false;
        if (cs.visibility==='hidden'||cs.opacity==='0'||cs.display==='none') return false;
        return true;
      }).map(e => ({ cls: (e.className && String(e.className)).slice(0,50), tag:e.tagName, b: (({x,y,width,height})=>({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) }));
      // overlap with map
      let over = [];
      if (map) {
        const M = {x1:map.x,y1:map.y,x2:map.x+map.w,y2:map.y+map.h};
        for (const f of floats) {
          const b=f.b; const x1=Math.max(M.x1,b.x), y1=Math.max(M.y1,b.y), x2=Math.min(M.x2,b.x+b.w), y2=Math.min(M.y2,b.y+b.h);
          const a=Math.max(0,x2-x1)*Math.max(0,y2-y1);
          if (a>400) over.push({cls:f.cls, area:a, pct:+(100*a/(map.w*map.h)).toFixed(1), b});
        }
      }
      const docW = document.documentElement.scrollWidth, winW = window.innerWidth;
      return { map, over, overflowX: docW - winW, winW, winH: window.innerHeight };
    });
    log(tag + ' :: map=' + JSON.stringify(m.map) + ' overflowX=' + m.overflowX);
    let tot = 0; m.over.forEach(o => { tot += o.pct; log('    OVER ' + o.pct + '% ' + o.cls + ' ' + JSON.stringify(o.b)); });
    log('    TOTAL FLOATING OVER MAP: ' + tot.toFixed(1) + '%');
    return m;
  };
  await page.waitForTimeout(2600);
  await shot('cold');
  await measure('COLD');
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>/Start the lesson/i.test(e.innerText)); if(b) b.click(); });
  await page.waitForTimeout(1800);
  await shot('beat1');
  await measure('BEAT1');
  for (const s of [3,6,9,11,14]) {
    await page.goto('http://localhost:8777/app/#tour=core&step='+s+'&filter=stage:working,pressure:off');
    await page.waitForTimeout(2000);
    await shot('beat'+s);
    await measure('BEAT'+s);
  }
};
