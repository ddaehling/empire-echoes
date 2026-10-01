/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P18 r3 — the narrow bands: sticky plates, one scroll, reachable list. */
module.exports = async ({ page, log, shot }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const boot = async (hash) => {
    await page.goto('http://localhost:8777/app/' + (hash || ''), { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
    await page.waitForTimeout(1800);
  };
  const LINK = '#year=1914&compare=1922&filter=cmp:peak,cmpr:1,stage:working';

  for (const [w, h] of [[390, 844], [768, 1024], [900, 700]]) {
    await page.setViewportSize({ width: w, height: h });
    await boot(LINK);
    const m = await page.evaluate(() => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const g = document.querySelector('.cmp__grid');
      const rows = [...document.querySelectorAll('.cmp__row')];
      const vis = rows.filter(r => { const q = r.getBoundingClientRect(); return q.top < window.innerHeight && q.bottom > 0 && q.top >= 0; }).length;
      return {
        bar: b('.cmp__bar'), plates: b('.cmp__plates'), a: b('.cmp__side[data-side=a]'), bside: b('.cmp__side[data-side=b]'),
        ca: b('.cmp__side[data-side=a] canvas'), cb: b('.cmp__side[data-side=b] canvas'),
        gridScroll: [g.scrollHeight, g.clientHeight], rows: rows.length, visRows: vis,
        labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g, ' ').trim()),
        picks: [...document.querySelectorAll('.cmp__pick')].map(e => { const r = e.getBoundingClientRect(); return [e.textContent, Math.round(r.x), Math.round(r.right)]; }),
        doc: [document.documentElement.scrollHeight, window.innerHeight],
        cmpOnStage: (() => { const c = document.querySelector('.cmp'); const st = document.querySelector('.app__stage'); if (!c || !st) return null; const a = c.getBoundingClientRect(), s2 = st.getBoundingClientRect(); return [Math.round(a.y - s2.y), Math.round(a.height - s2.height)]; })(),
      };
    });
    log(`--- ${w}x${h} ---\n` + JSON.stringify(m));
    t(`${w} both plates drawn`, m.ca && m.cb && m.ca.h > 90 && m.cb.h > 90, `A ${m.ca && m.ca.w}x${m.ca && m.ca.h} · B ${m.cb && m.cb.w}x${m.cb && m.cb.h}`);
    t(`${w} both years labelled`, m.labs.length === 2 && /1914/.test(m.labs[0]) && /1922/.test(m.labs[1]), m.labs.join(' | '));
    t(`${w} no document scroll`, m.doc[0] <= m.doc[1], m.doc.join(' / '));
    t(`${w} presets all inside the viewport or in a scroller`, m.picks.every(p => p[1] >= 0), JSON.stringify(m.picks.map(p => p[0] + ' ' + p[1] + '-' + p[2])));
    // scroll the compare surface and confirm the plates stay
    const scrolled = await page.evaluate(async () => {
      const g = document.querySelector('.cmp__grid');
      g.scrollTop = 600;
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 120));
      const p = document.querySelector('.cmp__plates').getBoundingClientRect();
      const rows = [...document.querySelectorAll('.cmp__row')];
      const vis = rows.filter(r => { const q = r.getBoundingClientRect(); return q.top >= 0 && q.bottom <= window.innerHeight; }).length;
      return { scrollTop: g.scrollTop, platesY: Math.round(p.y), platesH: Math.round(p.height), gridY: Math.round(g.getBoundingClientRect().y), visRows: vis };
    });
    t(`${w} plates stay while the list scrolls`, scrolled.scrollTop > 0 ? scrolled.platesY === scrolled.gridY : true,
      `scrollTop ${scrolled.scrollTop}, plates at y=${scrolled.platesY}, grid at y=${scrolled.gridY}, ${scrolled.visRows} rows now fully on screen`);
    t(`${w} named places reachable`, scrolled.visRows >= 2 || m.visRows >= 2, `${m.visRows} rows visible unscrolled, ${scrolled.visRows} after one scroll of ${m.rows} total`);
    await shot(`n-${w}`);
  }
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> NARROW BROKEN' : '>>> narrow holds');
};
