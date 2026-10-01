// Measure the plate and what covers it.
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const g = await page.evaluate(() => {
    const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x:Math.round(b.x), y:Math.round(b.y), w:Math.round(b.width), h:Math.round(b.height) }; };
    const out = {};
    const mounts = ['map','map-overlay','legend','stage-note','dossier','timeline','statusbar','toolbar','chrome-end','overlay'];
    for (const m of mounts) out['mount:'+m] = r(document.querySelector(`[data-mount="${m}"]`));
    out['#stage'] = r(document.querySelector('#stage'));
    out['svg'] = r(document.querySelector('#stage svg, [data-mount="map"] svg'));
    // every element that is positioned over the map plate
    const plate = document.querySelector('[data-mount="map"] svg') || document.querySelector('[data-mount="map"]');
    const pb = plate.getBoundingClientRect();
    const overs = [];
    document.querySelectorAll('body *').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') return;
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return;
      if (cs.pointerEvents === 'none' && !el.textContent.trim()) return;
      const b = el.getBoundingClientRect();
      if (b.width < 40 || b.height < 20) return;
      const ix = Math.max(0, Math.min(b.right, pb.right) - Math.max(b.x, pb.x));
      const iy = Math.max(0, Math.min(b.bottom, pb.bottom) - Math.max(b.y, pb.y));
      if (ix*iy < 4000) return;
      // skip if a parent already listed
      overs.push({ sel: el.tagName.toLowerCase()+'.'+[...el.classList].join('.'), area: Math.round(ix*iy), pct: +(100*ix*iy/(pb.width*pb.height)).toFixed(1), box: {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}, bg: cs.backgroundColor });
    });
    out.plate = { x:Math.round(pb.x), y:Math.round(pb.y), w:Math.round(pb.width), h:Math.round(pb.height) };
    out.overs = overs.sort((a,b)=>b.area-a.area).slice(0, 14);
    out.vh = innerHeight; out.vw = innerWidth;
    return out;
  });
  log(JSON.stringify(g, null, 1));
};
