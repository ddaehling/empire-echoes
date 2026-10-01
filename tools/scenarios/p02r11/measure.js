/**
 * p02r11/measure.js — the map band, and what stands on it.
 *
 * Prints, for the cold plate and for beats 1, 9, 12, 17, 21, 24:
 *   the .stage__map rectangle, the drawn canvas, the covered area (every
 *   painting positioned element that overlaps the DRAWN map), and the two
 *   furniture objects' own rectangles, so a corner collision is a number.
 */
const BEATS = [1, 9, 12, 17, 21, 24];

module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const ready = async () => {
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA
      && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1400);
  };
  const read = async () => page.evaluate(() => {
    const R = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const stage = document.querySelector('.stage__map');
    const cv = document.querySelector('.map__plate');
    const map = cv ? cv.getBoundingClientRect() : null;
    const over = [];
    let covered = 0;
    if (map && map.width > 4) {
      for (const el of document.querySelectorAll('#app *')) {
        const cs = getComputedStyle(el);
        if (cs.position === 'static' || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        if (el === cv || el.contains(cv) || cv.contains(el)) continue;
        if (el.classList.contains('map__tiplayer') || el.closest('.map__tiplayer')) continue;
        // a layer that paints nothing is not a box
        const paints = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'
          || cs.borderTopWidth !== '0px' || cs.boxShadow !== 'none' || (el.childElementCount === 0 && el.textContent.trim());
        if (!paints) continue;
        const b = el.getBoundingClientRect();
        const x0 = Math.max(b.left, map.left), x1 = Math.min(b.right, map.right);
        const y0 = Math.max(b.top, map.top), y1 = Math.min(b.bottom, map.bottom);
        if (x1 - x0 < 4 || y1 - y0 < 4) continue;
        // skip an ancestor of something we already counted (avoid double counting the big wrappers)
        if ([...document.querySelectorAll('#app *')].some((o) => o !== el && el.contains(o) && getComputedStyle(o).position !== 'static')) {
          // still count it if it paints its own background
          if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && cs.backgroundImage === 'none') continue;
        }
        const a = (x1 - x0) * (y1 - y0);
        covered += a;
        over.push({ sel: el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase(), area: Math.round(a), r: R(el) });
      }
    }
    const pick = (s) => { const e = document.querySelector(s); return e && e.getBoundingClientRect().height > 2 ? R(e) : null; };
    const app = document.getElementById('app');
    return {
      vw: innerWidth, vh: innerHeight,
      dock: app.dataset.dock, stageLevel: app.dataset.stage, path: app.dataset.path,
      footslot: (document.querySelector('.map__furniture') || {}).dataset ? document.querySelector('.map__furniture').dataset.footslot : null,
      zoomslot: document.querySelector('.map__furniture') ? document.querySelector('.map__furniture').dataset.zoomslot : null,
      stage: stage ? R(stage) : null,
      map: map ? { x: Math.round(map.x), y: Math.round(map.y), w: Math.round(map.width), h: Math.round(map.height) } : null,
      pctOfViewport: map ? Math.round(1000 * (map.width * map.height) / (innerWidth * innerHeight)) / 10 : null,
      covered: Math.round(covered),
      coveredPct: map && map.width ? Math.round(1000 * covered / (map.width * map.height)) / 10 : null,
      worst: over.sort((a, b) => b.area - a.area).slice(0, 6),
      zooms: pick('.map__zooms'), foot: pick('.map__foot'), key: pick('.stage__key'), dockfoot: pick('.stage__dock'),
      panel: (() => { const e = document.querySelector('.tr-panel__scroll'); return e ? { ch: e.clientHeight, sh: e.scrollHeight } : null; })(),
    };
  });

  await page.goto(base, { waitUntil: 'load' });
  await ready();
  let m = await read();
  log(`COLD  ${m.vw}x${m.vh} dock=${m.dock} stage=${m.stageLevel}  .stage__map ${m.stage.w}x${m.stage.h}  drawn ${m.map.w}x${m.map.h} (${m.pctOfViewport}% of viewport)  covered ${m.covered}px2 = ${m.coveredPct}%  slots foot=${m.footslot} zoom=${m.zoomslot}`);
  for (const w of m.worst) log('        on the map: ' + w.sel + ' ' + w.area + 'px2 at ' + JSON.stringify(w.r));
  await shot('cold');

  for (const s of BEATS) {
    await page.goto(base + '#tour=thirty&step=' + s, { waitUntil: 'load' });
    await ready();
    m = await read();
    log(`BEAT ${String(s).padStart(2)}  dock=${m.dock} stage=${m.stageLevel}  .stage__map ${m.stage.w}x${m.stage.h}  drawn ${m.map.w}x${m.map.h} (${m.pctOfViewport}%)  covered ${m.covered}px2 = ${m.coveredPct}%  slots foot=${m.footslot} zoom=${m.zoomslot}  panel ${m.panel ? m.panel.ch + '/' + m.panel.sh : '-'}`);
    for (const w of m.worst) log('        on the map: ' + w.sel + ' ' + w.area + 'px2 at ' + JSON.stringify(w.r));
    if (m.zooms) log('        .map__zooms ' + JSON.stringify(m.zooms) + '   .map__foot ' + JSON.stringify(m.foot));
    await shot('beat' + s);
  }
};
