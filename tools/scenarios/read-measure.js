/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * read-measure.js — B3 reproduction: how much readable panel does a mounted
 * beat get, and how much content is stuffed into it?
 *
 *   node tools/inspect.js tools/scenarios/read-measure.js --out /tmp/rm390 --mobile
 *
 * Env: STEP (default 17), TOUR (default thirty)
 */
const STEP = process.env.STEP || '17';
const TOUR = process.env.TOUR || 'thirty';

module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=' + TOUR + '&step=' + STEP, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2200);

  const info = await page.evaluate(() => {
    const app = document.getElementById('app');
    const cs = getComputedStyle(app);
    const box = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        sh: e.scrollHeight, ch: e.clientHeight, ov: getComputedStyle(e).overflowY };
    };
    const sels = ['.app__bar', '.app__lede', '.app__stage', '.stage__map', '.map__canvas', 'canvas',
      '.stage__key', '.stage__dock', '.app__time', '.app__foot', '.app__dossier', '.app__sheet',
      '.cx-sheet', '.cx-sheet__body', '.cx-sheet__head', '.tr-panel', '.tr-panel__scroll', '.tr-panel__head',
      '.tr-dock', '.bar__dock', '.legend__pin', '.tl-root'];
    const boxes = sels.map(box).filter(Boolean);
    // scroller chain: every element with overflow auto/scroll that has content taller than box
    const scrollers = [];
    document.querySelectorAll('*').forEach(e => {
      const c = getComputedStyle(e);
      if (/(auto|scroll)/.test(c.overflowY)) {
        const r = e.getBoundingClientRect();
        if (r.height > 0) scrollers.push({
          cls: (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className) || e.id || e.tagName,
          h: Math.round(r.height), sh: e.scrollHeight, over: e.scrollHeight - Math.round(r.height)
        });
      }
    });
    const tourText = (document.querySelector('.tr-panel') || {}).innerText || '';
    return {
      vw: innerWidth, vh: innerHeight,
      dock: app.getAttribute('data-dock'), rail: app.getAttribute('data-rail'),
      stage: app.getAttribute('data-stage'), path: app.getAttribute('data-path'),
      bar: app.getAttribute('data-bar'), foot: app.getAttribute('data-foot'),
      vars: ['--bar-h','--lede-h','--key-h','--time-h','--foot-h','--dock-h','--map-min','--rail-top-min','--cx-sheet-min','--stage-top','--stage-height','--read-mode']
        .reduce((o,k)=>{o[k]=cs.getPropertyValue(k).trim();return o;},{}),
      boxes,
      scrollers: scrollers.filter(s => s.over > 4).sort((a,b)=>b.over-a.over).slice(0,10),
      allScrollers: scrollers.length,
      words: tourText.trim().split(/\s+/).filter(Boolean).length,
      docScroll: document.documentElement.scrollHeight + '/' + innerHeight,
      beatKind: (document.querySelector('.tr-panel') || document.body).getAttribute('data-kind') || null,
      panelHTMLKinds: [...document.querySelectorAll('[data-kind],[data-beat-kind],[data-mode]')].slice(0,10).map(e=>e.tagName+'.'+e.className+' k='+(e.getAttribute('data-kind')||e.getAttribute('data-beat-kind')||e.getAttribute('data-mode'))),
    };
  });
  log(JSON.stringify(info, null, 1));
  await shot('step' + STEP);
};
