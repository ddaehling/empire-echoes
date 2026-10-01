/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  const steps = (process.env.STEPS || '1,4,18,20').split(',');
  for (const S of steps) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + S, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const R = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect();
        return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), y: Math.round(b.y), b: Math.round(b.bottom), sh: e.scrollHeight, ch: e.clientHeight }; };
      const app = document.getElementById('app');
      // anything clipped by its own region
      const clipped = [];
      for (const sel of ['.app__time', '.app__lede', '.app__bar', '.stage__map']) {
        const e = document.querySelector(sel); if (!e) continue;
        const pb = e.getBoundingClientRect();
        for (const c of e.querySelectorAll('*')) {
          const cs = getComputedStyle(c);
          if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
          const b = c.getBoundingClientRect();
          if (b.height < 3 || b.width < 3) continue;
          if (b.bottom > pb.bottom + 1 || b.top < pb.top - 1)
            clipped.push(sel + ' > ' + (c.className||c.tagName) + ' ' + Math.round(b.top) + '..' + Math.round(b.bottom) + ' vs ' + Math.round(pb.top) + '..' + Math.round(pb.bottom));
        }
      }
      const scrollers = [];
      for (const root of ['.app__sheet', '.app__dossier']) {
        const n = document.querySelector(root); if (!n) continue;
        for (const e of [n, ...n.querySelectorAll('*')]) {
          const cs = getComputedStyle(e);
          if (!/(auto|scroll)/.test(cs.overflowY)) continue;
          if (e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 8) scrollers.push((e.className||e.tagName) + ' ' + e.clientHeight + '/' + e.scrollHeight);
        }
      }
      return {
        read: app.dataset.read, work: app.dataset.beatwork, fit: document.documentElement.getAttribute('data-tour-fit'),
        kind: (document.querySelector('.tr-panel')||{}).getAttribute ? document.querySelector('.tr-panel').getAttribute('data-kind') : null,
        map: R('.stage__map'), key: R('.legend__pin') || R('.stage__key'), time: R('.app__time'),
        ax: R('.tl-ax'), year: R('.tl__year'), sheet: R('.app__sheet'), scroll: R('.tr-panel__scroll'),
        peek: R('.map__peek'), lede: R('.app__lede'),
        clipped: clipped.slice(0, 6), scrollers,
        doc: document.documentElement.scrollHeight + '/' + innerHeight,
      };
    });
    log('step ' + S + ' kind=' + r.kind + ' fit=' + r.fit + ' read=' + r.read + ' work=' + r.work);
    log('   map ' + JSON.stringify(r.map) + ' peek ' + JSON.stringify(r.peek));
    log('   key ' + JSON.stringify(r.key) + ' time ' + JSON.stringify(r.time) + ' ax ' + JSON.stringify(r.ax) + ' year ' + JSON.stringify(r.year));
    log('   lede ' + JSON.stringify(r.lede) + ' sheet ' + JSON.stringify(r.sheet));
    log('   READABLE ' + (r.scroll ? r.scroll.h + ' of ' + r.scroll.sh : 'none') + '   scrollers=' + JSON.stringify(r.scrollers) + ' doc=' + r.doc);
    if (r.clipped.length) r.clipped.forEach(c => log('   CLIPPED ' + c));
    await shot('s' + S);
  }
};
