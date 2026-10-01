/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(800);

  // tap "Start the lesson"
  const start = page.locator('button:has-text("Start the lesson"), a:has-text("Start the lesson")').first();
  await start.click();
  await page.waitForTimeout(900);

  const measure = async () => await page.evaluate(() => {
    const R = e => { const b = e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
    const q = s => { const e=document.querySelector(s); return e?R(e):null; };
    const vw=innerWidth, vh=innerHeight;
    // map rect
    const map = q('.stage__map') || q('[data-mount="map"]');
    // anything floating that intersects map
    let floats=[];
    if (map) {
      document.querySelectorAll('body *').forEach(e=>{
        const cs=getComputedStyle(e);
        if (cs.position!=='fixed' && cs.position!=='absolute') return;
        if (cs.visibility==='hidden'||cs.display==='none'||cs.opacity==='0') return;
        const b=e.getBoundingClientRect();
        if (b.width<12||b.height<12) return;
        // must be inside map rect at least partly
        const ix=Math.max(0,Math.min(b.right,map.x+map.w)-Math.max(b.left,map.x));
        const iy=Math.max(0,Math.min(b.bottom,map.y+map.h)-Math.max(b.top,map.y));
        if (ix*iy<400) return;
        // ignore the map container itself and its svg
        if (e.classList.contains('stage__map')) return;
        if (e.closest('[data-mount="map"]')===e.closest('[data-mount="map"]') && e.tagName==='svg') return;
        floats.push({cls:(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||'').toString().slice(0,60), tag:e.tagName, r:R(e), area:Math.round(ix*iy)});
      });
    }
    floats.sort((a,b)=>b.area-a.area);
    // dedupe nested: keep top 6
    const panel = q('.beat, .tour-panel, [data-mount="beat"], .beat-panel');
    // clipped / overflowing text
    const clipped=[];
    document.querySelectorAll('p,h1,h2,h3,li,button,span,div').forEach(e=>{
      if (e.children.length) return;
      const t=(e.textContent||'').trim(); if (t.length<12) return;
      if (e.scrollHeight > e.clientHeight+2 && e.clientHeight>0) clipped.push({t:t.slice(0,60), sh:e.scrollHeight, ch:e.clientHeight});
      else if (e.scrollWidth > e.clientWidth+2 && e.clientWidth>0) clipped.push({t:t.slice(0,60), sw:e.scrollWidth, cw:e.clientWidth});
    });
    // small tap targets among visible controls
    const small=[]; const off=[];
    document.querySelectorAll('button,a[href],input,select,[role="button"]').forEach(e=>{
      const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
      if (cs.visibility==='hidden'||cs.display==='none'||b.width===0) return;
      if (b.width<40||b.height<40) small.push({t:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,32), w:Math.round(b.width),h:Math.round(b.height)});
      if (b.right>vw+1||b.left<-1||b.bottom>vh+1||b.top<0) off.push({t:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,32), r:R(e)});
    });
    return {vw,vh,map,panel,scrollH:document.documentElement.scrollHeight,scrollW:document.documentElement.scrollWidth,
      floats:floats.slice(0,6), clipped:clipped.slice(0,8), small:small.slice(0,10), off:off.slice(0,8),
      year: (q=>null)(), text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,2200)};
  });

  for (let i=1;i<=30;i++) {
    const m = await measure();
    log('--- STEP '+i+' ---');
    log('geom', JSON.stringify({map:m.map,panel:m.panel,scrollH:m.scrollH,scrollW:m.scrollW}));
    log('floats-over-map', JSON.stringify(m.floats));
    log('clipped', JSON.stringify(m.clipped));
    log('smallTargets', JSON.stringify(m.small));
    log('offscreenControls', JSON.stringify(m.off));
    log('TEXT>>>\n'+m.text+'\n<<<');
    await shot('step'+String(i).padStart(2,'0'));
    // find Next
    const next = page.locator('button:has-text("Next"), button[data-act="next"], .beat__next, button:has-text("Go on")').first();
    const cnt = await next.count();
    if (!cnt) { log('NO NEXT at step '+i); break; }
    const vis = await next.isVisible().catch(()=>false);
    if (!vis) { log('NEXT NOT VISIBLE at step '+i); break; }
    const dis = await next.isDisabled().catch(()=>false);
    if (dis) {
      log('NEXT DISABLED at step '+i+' — gate. trying to satisfy gate');
      // click first plausible option/answer
      const opts = page.locator('.gate button, .beat button, [role="radio"], .opt, .choice');
      const n = await opts.count();
      log('gate options: '+n);
      for (let k=0;k<Math.min(n,3);k++){
        const o=opts.nth(k);
        const tt=(await o.textContent().catch(()=>''))||'';
        log('opt '+k+': '+tt.trim().slice(0,60));
      }
      if (n) { await opts.first().click().catch(()=>{}); await page.waitForTimeout(600); }
    }
    await next.click({timeout:5000}).catch(e=>log('NEXT CLICK FAILED: '+e.message));
    await page.waitForTimeout(800);
  }
};
