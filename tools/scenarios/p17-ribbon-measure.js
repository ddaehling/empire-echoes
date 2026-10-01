/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — what the ribbon actually draws in the docked band, and whether any
   swatch is cut. Also: does the strip ever overlap the lede? */
module.exports = async ({ page, shot, log }) => {
  const read = () => page.evaluate(() => {
    const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const app = document.getElementById('app');
    const rib = document.querySelector('.legend--ribbon');
    const list = rib && rib.querySelector('.legend__ribbon-list');
    const route = rib && rib.querySelector('.legend__route');
    const key = document.querySelector('.stage__key');
    const pin = document.querySelector('.legend__pin');
    const lede = document.querySelector('.app__lede, .stage__lede, [data-mount="lede"], .cx-lede');
    const zooms = document.querySelector('.map__zooms');
    const cvs = [...document.querySelectorAll('.stage__map canvas, .map canvas, canvas')].map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }; }).sort((a,b) => b.w * b.h - a.w * a.h)[0] || null;
    const smap = document.querySelector('.stage__map');
    const items = rib ? [...rib.querySelectorAll('.legend__rib')].map(li => {
      const w = li.querySelector('.legend__rib-w');
      const r = li.getBoundingClientRect();
      const wr = w ? w.getBoundingClientRect() : null;
      return { hidden: li.hidden, tier: li.dataset.tier, word: (w && w.textContent) || '',
               x: Math.round(r.x), r: Math.round(r.right), w: Math.round(r.width),
               wordRight: wr ? Math.round(wr.right) : null,
               wordScroll: w ? w.scrollWidth : null, wordClient: w ? w.clientWidth : null };
    }) : [];
    const csKey = key ? getComputedStyle(key) : null;
    return {
      dock: app.dataset.dock, stage: app.dataset.stage, rail: app.dataset.rail,
      keyBox: box(key), keyPadEnd: csKey ? csKey.paddingInlineEnd : null,
      pinBox: box(pin), ledeBox: box(lede), zoomBox: box(zooms),
      canvas: cvs, mapRect: box(smap),
      ribBox: box(rib), listBox: box(list), listClient: list ? list.clientWidth : null,
      listScroll: list ? list.scrollWidth : null,
      route: route ? { hidden: route.hidden, text: route.textContent, ...box(route) } : null,
      fit: rib ? rib.dataset.fit + '/' + rib.dataset.tier : null,
      items,
    };
  });

  const at = async (label, url) => {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const m = await read();
    log('\n=== ' + label + ' ' + url);
    log('dock=' + m.dock + ' stage=' + m.stage + ' rail=' + m.rail + ' fit=' + m.fit);
    log('MAP drawn canvas ' + JSON.stringify(m.canvas) + '  .stage__map ' + JSON.stringify(m.mapRect));
    log('stage__key ' + JSON.stringify(m.keyBox) + ' padInlineEnd=' + m.keyPadEnd);
    log('legend__pin ' + JSON.stringify(m.pinBox));
    log('lede ' + JSON.stringify(m.ledeBox));
    log('zooms ' + JSON.stringify(m.zoomBox));
    log('ribbon ' + JSON.stringify(m.ribBox));
    log('list ' + JSON.stringify(m.listBox) + ' client=' + m.listClient + ' scroll=' + m.listScroll);
    log('route ' + JSON.stringify(m.route));
    for (const i of m.items) log('  ' + (i.hidden ? 'HID ' : 'SHOW') + ' [' + i.tier + '] "' + i.word + '" x' + i.x + '..' + i.r + ' wordRight=' + i.wordRight + ' wordScroll=' + i.wordScroll + '/' + i.wordClient + (i.wordScroll > i.wordClient ? '  <<< CUT' : ''));
    // overlaps
    const K = m.pinBox && m.pinBox.h ? m.pinBox : m.keyBox;
    if (K && m.ledeBox) {
      const ov = Math.max(0, Math.min(K.b, m.ledeBox.b) - Math.max(K.y, m.ledeBox.y)) * Math.max(0, Math.min(K.r, m.ledeBox.r) - Math.max(K.x, m.ledeBox.x));
      log('KEY x LEDE overlap = ' + ov + ' px2');
    }
    if (K && m.zoomBox) {
      const ov = Math.max(0, Math.min(K.b, m.zoomBox.b) - Math.max(K.y, m.zoomBox.y)) * Math.max(0, Math.min(K.r, m.zoomBox.r) - Math.max(K.x, m.zoomBox.x));
      log('KEY x ZOOMS overlap = ' + ov + ' px2 (zooms should sit INSIDE the strip)');
      const routeBox = m.route;
      if (routeBox && !routeBox.hidden) {
        const o2 = Math.max(0, Math.min(routeBox.b, m.zoomBox.b) - Math.max(routeBox.y, m.zoomBox.y)) * Math.max(0, Math.min(routeBox.r, m.zoomBox.r) - Math.max(routeBox.x, m.zoomBox.x));
        log('ROUTE x ZOOMS overlap = ' + o2 + ' px2  <<< must be 0');
      }
    }
    await shot(label);
    return m;
  };

  await at('cold', 'http://localhost:8777/app/');
  await at('beat9', 'http://localhost:8777/app/#tour=thirty&step=9');
  await at('beat1', 'http://localhost:8777/app/#tour=thirty&step=1');
};
