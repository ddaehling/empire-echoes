/**
 * p21/repro.js — the responsive engineer's reproduction.
 * Walks beats 1, 4, 9, 14, 23 of the guided path and measures, at each one,
 * every rectangle that could stand on the map plate.
 */
const BEATS = [1, 4, 9, 14, 23];

module.exports = async ({ page, shot, log }) => {
  const measure = () => page.evaluate(() => {
    const vis = (e) => {
      if (!e) return false;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
      const r = e.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const B = (s) => {
      const e = document.querySelector(s); if (!vis(e)) return null;
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               r: Math.round(r.right), b: Math.round(r.bottom),
               pos: getComputedStyle(e).position, z: getComputedStyle(e).zIndex };
    };
    const ov = (a, b) => {
      if (!a || !b) return 0;
      const w = Math.max(0, Math.min(a.r, b.r) - Math.max(a.x, b.x));
      const h = Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y));
      return Math.round(w * h);
    };
    const app = document.getElementById('app');
    const cs = getComputedStyle(app);
    const V = (n) => cs.getPropertyValue(n).trim();

    const plate = B('.stage__map') || B('.app__stage');
    const drawn = B('canvas.map__plate') || B('.map__plate');
    const parts = {};
    for (const sel of ['.app__bar', '.app__lede', '.app__stage', '.stage__map', '.stage__key',
                       '.app__time', '.app__foot', '.app__sheet', '.app__dossier',
                       '.map__furniture', '.map__head', '.map__foot', '.map__switch',
                       '.map__defs', '.map__zooms', '.map__zoom', '.map__rail',
                       '.tr-dock', '.tr-bar', '.tr-bar__next', '.tr-bar__back',
                       '.cx-sheet__body', '.cx-sheet__head', '.legend__pin', '.legend',
                       '.cl-bar', '.bar__slot--main', '.bar__slot--end', '.bar__more']) {
      parts[sel] = B(sel);
    }
    // the zoom cluster: whatever holds the +/-/home buttons
    const zoomBtns = [...document.querySelectorAll('.map__zoom')].filter(vis);
    let zoomCluster = null;
    if (zoomBtns.length) {
      const rs = zoomBtns.map(e => e.getBoundingClientRect());
      const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
      const rr = Math.max(...rs.map(r => r.right)), bb = Math.max(...rs.map(r => r.bottom));
      zoomCluster = { x: Math.round(x), y: Math.round(y), w: Math.round(rr - x), h: Math.round(bb - y), r: Math.round(rr), b: Math.round(bb),
                      parent: zoomBtns[0].parentElement ? zoomBtns[0].parentElement.className : '?' , n: zoomBtns.length };
    }

    // everything fixed/absolute that overlaps the plate rectangle
    const onPlate = [];
    if (plate) {
      for (const e of document.querySelectorAll('body *')) {
        if (!vis(e)) continue;
        const p = getComputedStyle(e).position;
        if (p !== 'fixed' && p !== 'absolute') continue;
        if (e.closest('.stage__map')) continue;
        const r = e.getBoundingClientRect();
        const bb = { x: r.left, y: r.top, r: r.right, b: r.bottom };
        const a = ov(plate, bb);
        if (a > 4000) {
          // skip if an ancestor already reported (report topmost only)
          if (e.parentElement && onPlate.some(o => o.el === e.parentElement)) continue;
          onPlate.push({ el: e, sel: e.tagName.toLowerCase() + '.' + String(e.className).trim().split(/\s+/).slice(0,2).join('.'),
                         w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), area: a, pos: p,
                         z: getComputedStyle(e).zIndex });
        }
      }
    }

    // clipped text inside the beat panel and the lede
    const clipped = [];
    for (const sel of ['.app__sheet', '.app__lede', '.app__time', '.app__bar', '.app__stage']) {
      const region = document.querySelector(sel); if (!region) continue;
      const rr = region.getBoundingClientRect();
      for (const e of region.querySelectorAll('*')) {
        if (!vis(e)) continue;
        if (!e.childNodes.length) continue;
        const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 3);
        if (!hasText) continue;
        const r = e.getBoundingClientRect();
        if (r.bottom > rr.bottom + 1 || r.top < rr.top - 1) {
          clipped.push({ region: sel, cls: String(e.className).slice(0,40), y: Math.round(r.top), b: Math.round(r.bottom),
                         regionB: Math.round(rr.bottom), txt: e.textContent.trim().slice(0, 50) });
        } else if (e.scrollHeight > e.clientHeight + 2 && getComputedStyle(e).overflowY === 'hidden') {
          clipped.push({ region: sel, cls: String(e.className).slice(0,40), sh: e.scrollHeight, ch: e.clientHeight,
                         txt: e.textContent.trim().slice(0, 50) });
        }
      }
    }

    // the through-line cloze
    const cl = document.querySelector('.cl-bar, .cl-say');
    const blanks = document.querySelectorAll('.cl-say__blank').length;

    return {
      vw: innerWidth, vh: innerHeight,
      rail: app.dataset.rail, stage: app.dataset.stage, bar: app.dataset.bar,
      sheet: app.dataset.sheet, dossier: app.dataset.dossier,
      vars: { barH: V('--bar-h'), ledeH: V('--lede-h'), timeH: V('--time-h'), footH: V('--foot-h'),
              keyH: V('--key-h'), railClear: V('--rail-clear'), dockFloor: V('--dock-floor'),
              stageTop: V('--stage-top'), stageHeight: V('--stage-height'), railTopMin: V('--rail-top-min') },
      plate, drawn, parts, zoomCluster,
      onPlate: onPlate.map(({ el, ...o }) => o),
      clipped: clipped.slice(0, 12),
      cloze: cl ? { cls: cl.className, blanks, txt: cl.textContent.trim().slice(0, 80) } : { present: false, blanks },
      overlaps: {
        'dock/plate': ov(plate, parts['.tr-dock']),
        'zoom/plate': zoomCluster ? ov(plate, zoomCluster) : 0,
        'switch/plate': ov(plate, parts['.map__switch']),
        'furniture/plate': ov(plate, parts['.map__furniture']),
        'dock/switch': ov(parts['.tr-dock'], parts['.map__switch']),
        'sheet/plate': ov(plate, parts['.app__sheet']),
      },
      scroll: { sh: document.documentElement.scrollHeight, ih: innerHeight },
      barCount: document.querySelectorAll('.app__bar button, .app__bar a[href]').length,
      barVisible: [...document.querySelectorAll('.app__bar button, .app__bar a[href]')].filter(vis).length,
    };
  });

  for (const step of BEATS) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    const m = await measure();
    log('\n########## STEP ' + step + '  ' + m.vw + 'x' + m.vh + ' ##########');
    log('rail=' + m.rail + ' stage=' + m.stage + ' bar=' + m.bar + ' sheet=' + m.sheet + ' dossier=' + m.dossier);
    log('vars ' + JSON.stringify(m.vars));
    log('plate ' + JSON.stringify(m.plate));
    log('drawn ' + JSON.stringify(m.drawn));
    log('zoomCluster ' + JSON.stringify(m.zoomCluster));
    for (const [k, v] of Object.entries(m.parts)) if (v) log('  ' + k.padEnd(20) + ' ' + JSON.stringify(v));
    log('OVERLAPS ' + JSON.stringify(m.overlaps));
    log('ON PLATE (>4000px2):'); m.onPlate.forEach(o => log('   ' + JSON.stringify(o)));
    log('CLIPPED:'); m.clipped.forEach(o => log('   ' + JSON.stringify(o)));
    log('cloze ' + JSON.stringify(m.cloze));
    log('scroll ' + JSON.stringify(m.scroll) + '  barControls ' + m.barVisible + '/' + m.barCount);
    await shot('step' + step);
  }
};
