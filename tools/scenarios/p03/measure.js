/* p03/measure.js — the timeline's own budget probe.
   Reports the time-bar geometry, clipping, control count, word count and font
   registers at each disclosure stage. */
const probe = () => {
  const box = (s, r = document) => { const e = r.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const region = document.querySelector('.app__time');
  const tl = document.querySelector('.tl');
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const b = e.getBoundingClientRect(); if (!b.width || !b.height) return false; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false; return b.top < vh && b.bottom > 0 && b.left < vw && b.right > 0; };
  const ctrls = region ? [...region.querySelectorAll('button,a[href],select,input,[tabindex]:not([tabindex="-1"])')].filter(vis) : [];
  const sizes = {};
  let words = 0;
  if (region) {
    const w = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = n.nodeValue.trim(); if (!t) continue;
      const el = n.parentElement; if (!el || !vis(el)) continue;
      words += t.split(/\s+/).length;
      const fs = Math.round(parseFloat(getComputedStyle(el).fontSize));
      sizes[fs] = (sizes[fs] || 0) + 1;
    }
  }
  // anything inside the time region that is clipped by it
  let overflow = 0, clipped = [];
  if (region && tl) {
    const rb = region.getBoundingClientRect();
    overflow = Math.round(tl.scrollHeight - Math.round(rb.height));
    for (const e of region.querySelectorAll('*')) {
      if (!e.textContent.trim()) continue;
      const b = e.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (b.bottom > rb.bottom + 1 || b.top < rb.top - 1) clipped.push((e.className || e.tagName) + ' ' + Math.round(b.top) + '..' + Math.round(b.bottom) + ' | ' + e.textContent.trim().slice(0, 40));
    }
  }
  return {
    stage: document.documentElement.dataset.stage,
    regionH: region ? Math.round(region.getBoundingClientRect().height) : null,
    tlScrollH: tl ? tl.scrollHeight : null,
    overflow,
    clipped: clipped.slice(0, 8),
    ctrlCount: ctrls.length,
    ctrlLabels: ctrls.map(e => (e.getAttribute('aria-label') || e.textContent.trim() || e.tagName).slice(0, 28)),
    words,
    sizes,
    docScroll: document.documentElement.scrollHeight,
    innerH: vh,
    map: box('.stage__map canvas') || box('.stage__map svg'),
    time: box('.app__time'),
  };
};

module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  log('PLATE ' + JSON.stringify(await page.evaluate(probe)));
  await shot('plate');

  // working: press +1
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'working' }));
  await page.waitForTimeout(900);
  log('WORKING ' + JSON.stringify(await page.evaluate(probe)));
  await shot('working');

  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(900);
  log('APPARATUS ' + JSON.stringify(await page.evaluate(probe)));
  await shot('apparatus');

  // apparatus + a busy year
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(900);
  log('APPARATUS-1900 ' + JSON.stringify(await page.evaluate(probe)));
  await shot('apparatus-1900');

  // with a territory open (rail)
  await page.evaluate(() => window.BEA.store.dispatch('selectTerritory', 'india'));
  await page.waitForTimeout(1000);
  log('RAIL ' + JSON.stringify(await page.evaluate(probe)));
  await shot('rail');
};
