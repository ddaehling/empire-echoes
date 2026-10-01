/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const r = e => { if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
    const c = q('.map__plate');
    return {
      vp: {w: innerWidth, h: innerHeight, dpr: devicePixelRatio},
      stage: r(q('.app__stage')), stagemap: r(q('.stage__map')),
      canvasBox: r(c), canvasPx: c ? {w:c.width,h:c.height} : null,
      time: r(q('.app__time')), bar: r(q('.app__bar')), foot: r(q('.app__foot')),
      rail: r(q('.map__rail')), switch: r(q('.map__switch')), controls: r(q('.map__controls')),
      legend: r(q('.stage__legend')), note: r(q('.stage__note')),
      overlayKids: [...document.querySelectorAll('#app [data-mount="overlay"] > *')].map(e=>e.className),
      stageOverKids: [...document.querySelectorAll('.stage__over > *')].map(e=>e.className+' '+JSON.stringify(r(e))),
    };
  });
  log(JSON.stringify(m, null, 1));
  // land bbox by pixel sampling
  const bbox = await page.evaluate(() => {
    const c = document.querySelector('.map__plate');
    const g = c.getContext('2d');
    const d = g.getImageData(0,0,c.width,c.height).data;
    // find sea colour = most common
    const counts = new Map();
    for (let i=0;i<d.length;i+=4*17){ const k=(d[i]<<16)|(d[i+1]<<8)|d[i+2]; counts.set(k,(counts.get(k)||0)+1); }
    let sea=0,best=0; for(const [k,v] of counts) if(v>best){best=v;sea=k;}
    let x0=1e9,y0=1e9,x1=-1,y1=-1,land=0,tot=0;
    for(let y=0;y<c.height;y+=2) for(let x=0;x<c.width;x+=2){ const i=(y*c.width+x)*4; const k=(d[i]<<16)|(d[i+1]<<8)|d[i+2]; tot++; if(k!==sea){ land++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
    return {seaHex:sea.toString(16), canvas:{w:c.width,h:c.height}, x0,y0,x1,y1, landFrac:+(land/tot).toFixed(3), widthFrac:+(((x1-x0)/c.width)).toFixed(3)};
  });
  log('LANDBBOX ' + JSON.stringify(bbox));
  await shot('boot');
};
