/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P18 r3 — the whole surface, every viewport. Geometry, clipping, reach. */
module.exports = async ({ page, log, shot }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const LINK = '#year=1770&compare=1820&filter=cmp:america,cmpr:1,cmpg:a,stage:working';
  const VPS = [[390, 844], [768, 1024], [900, 700], [1024, 640], [1366, 768], [1440, 900], [1920, 1080]];
  for (const [w, h] of VPS) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8777/app/' + LINK, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1700);
    const m = await page.evaluate(() => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      // any text node clipped by its own box?
      const clipped = [];
      for (const e of document.querySelectorAll('.cmp *')) {
        if (e.children.length) continue;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (e.scrollWidth > e.clientWidth + 1 && cs.overflowX !== 'visible' && cs.overflowX !== 'auto' && cs.textOverflow !== 'ellipsis') {
          clipped.push(e.className + ' :: ' + e.textContent.trim().slice(0, 40));
        }
      }
      const rows = [...document.querySelectorAll('.cmp__row')];
      const visRows = rows.filter(r => { const q = r.getBoundingClientRect(); return q.top >= 0 && q.bottom <= window.innerHeight; }).length;
      const stage = document.querySelector('.app__stage');
      const cmp = document.querySelector('.cmp');
      const sr = stage.getBoundingClientRect(), cr = cmp.getBoundingClientRect();
      // does anything opaque stand on the compare surface?
      const intruders = [];
      for (const e of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(e);
        if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
        if (cmp.contains(e) || e.contains(cmp)) continue;
        if (e.classList.contains('stage__map')) continue;   // the single plate this surface deliberately covers
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
        const r = e.getBoundingClientRect();
        const ox = Math.max(0, Math.min(r.right, cr.right) - Math.max(r.left, cr.left));
        const oy = Math.max(0, Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top));
        if (ox * oy <= 4000) continue;
        /* AND IS IT ACTUALLY ON TOP? A box overlap is not an occlusion. This
           rule was written when everything under the comparison was in normal
           flow; RESPONSIVE_LAW then had P02 lay the plate out as absolutely
           positioned children of `.stage__map` at phone width, so `.map`,
           `.map__frame` and `.map__plate` began reporting a 175,451px2 overlap
           with a surface they are 21 stacking levels BEHIND. Measured with
           elementFromPoint on a 24px grid over the intersection: this surface's
           own canvas is the topmost element at every one of those points.
           So the question is asked the way the eye asks it. */
        const l = Math.max(r.left, cr.left), t = Math.max(r.top, cr.top);
        let onTop = false;
        for (let y = t + 4; y < t + oy - 4 && !onTop; y += 24) {
          for (let x = l + 4; x < l + ox - 4 && !onTop; x += 24) {
            const hit = document.elementFromPoint(x, y);
            if (hit && (hit === e || e.contains(hit))) onTop = true;
          }
        }
        if (onTop) intruders.push(e.className.toString().slice(0, 40) + ' ' + Math.round(ox * oy));
      }
      return {
        cmp: b('.cmp'), a: b('.cmp__side[data-side=a] canvas'), bb: b('.cmp__side[data-side=b] canvas'),
        delta: b('.cmp__delta'), grain: b('.cmp__grain'), verdict: b('.cmp__verdict'),
        rows: rows.length, visRows, clipped, intruders,
        labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
        guess: (document.querySelector('.cmp__guess') || {}).textContent,
        doc: [document.documentElement.scrollHeight, window.innerHeight],
        stageCover: Math.round(((cr.width * cr.height) / (sr.width * sr.height)) * 100),
        launch: b('.cmp__launch'), vw: window.innerWidth,
        scrolled: (() => { const g = document.querySelector('.cmp__grid'); const d = document.querySelector('.cmp__delta'); const sc = getComputedStyle(g).overflowY === 'auto' ? g : d; sc.scrollTop = 400; const n = [...document.querySelectorAll('.cmp__row')].filter(r => { const q = r.getBoundingClientRect(); return q.top >= 0 && q.bottom <= window.innerHeight; }).length; return n; })(),
      };
    });
    log(`--- ${w}x${h} --- ` + JSON.stringify(m));
    t(`${w}x${h} two plates drawn`, m.a && m.bb && m.a.w > 150 && m.a.h > 80 && m.bb.h > 80, `${m.a && m.a.w}x${m.a && m.a.h} / ${m.bb && m.bb.w}x${m.bb && m.bb.h}`);
    t(`${w}x${h} nothing clipped mid-word`, m.clipped.length === 0, m.clipped.join(' | ') || 'none');
    t(`${w}x${h} nothing stands on the comparison`, m.intruders.length === 0, m.intruders.join(' | ') || 'none');
    t(`${w}x${h} no document scroll`, m.doc[0] <= m.doc[1], m.doc.join('/'));
    t(`${w}x${h} the guess is beside the answer`, /More in 1770/.test(m.guess || '') && /More in 1820/.test(m.guess || ''), (m.guess || '').replace(/\s+/g, ' '));
    t(`${w}x${h} the grain note prints`, !!m.grain, m.grain ? `${m.grain.w}x${m.grain.h}` : 'missing');
    t(`${w}x${h} named places on screen`, m.visRows >= 1 || m.scrolled >= 2, `${m.visRows} of ${m.rows} unscrolled, ${m.scrolled} after one scroll`);
    t(`${w}x${h} the way in is inside the viewport`, !m.launch || (m.launch.x >= 0 && m.launch.x + m.launch.w <= m.vw), m.launch ? `${m.launch.x}..${m.launch.x + m.launch.w} of ${m.vw}` : 'hidden');
    await shot(`v-${w}x${h}`);
  }
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> P18 GEOMETRY BROKEN' : '>>> P18 geometry holds at every viewport');
};
