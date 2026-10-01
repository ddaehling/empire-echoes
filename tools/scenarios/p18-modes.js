/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* AT3 + the modes: 390x844, dark, reduced motion, and the rail open. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'america', reveal: true }));
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), disp: cs.display, vis: cs.visibility }; };
    const A = box('.cmp__side[data-side=a]'), B = box('.cmp__side[data-side=b]');
    const tabs = document.querySelectorAll('[role="tab"], .cmp [role="tablist"]').length;
    const labs = [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g, ' '));
    const del = box('.cmp__delta');
    return {
      A, B, delta: del, labs, tabs,
      stacked: A && B && B.y >= A.y + A.h - 2 && Math.abs(A.x - B.x) < 2,
      bothVisible: A && B && A.h > 40 && B.h > 40 && A.disp !== 'none' && B.disp !== 'none',
      docScroll: document.documentElement.scrollHeight - innerHeight,
      canvases: [...document.querySelectorAll('.cmp canvas')].map(c => c.width + 'x' + c.height),
      deltaScrollable: del ? document.querySelector('.cmp__delta').scrollHeight > del.h : null,
      cmp: box('.cmp'),
      mapPlate: box('.stage__map'),
    };
  });
  log('MEASURE', JSON.stringify(m));
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const narrow = m.cmp.w < 62 * 16;
  const phone = m.cmp.w < 46 * 16;
  const deltaBelow = m.delta.y >= m.A.y + m.A.h - 2;
  if (phone) {
    t('AT3 below 46rem: plates stack, both labelled, never tabs',
      m.stacked && m.bothVisible && m.labs.length === 2 && /1770/.test(m.labs[0]) && /1820/.test(m.labs[1]) && m.tabs === 0,
      `A ${m.A.w}x${m.A.h} at y${m.A.y}, B ${m.B.w}x${m.B.h} at y${m.B.y} (stacked=${m.stacked}), labels "${m.labs.join('" / "')}", role=tab elements ${m.tabs}, delta ${m.delta.w}x${m.delta.h} with its own scroll`);
  } else if (narrow) {
    t('AT3 46-62rem: two up with the list beneath, both labelled, never tabs',
      m.bothVisible && deltaBelow && m.labs.length === 2 && m.tabs === 0 && m.A.h > 150,
      `A ${m.A.w}x${m.A.h}, B ${m.B.w}x${m.B.h}, delta ${m.delta.w}x${m.delta.h} beneath them, labels "${m.labs.join('" / "')}", role=tab elements ${m.tabs} — stacking here would have given each plate ${m.cmp.w}x${Math.round((m.cmp.h - 35) / 2 - 45)} and a world only ~${Math.round(((m.cmp.h - 35) / 2 - 45) * 2)}px wide`);
  } else {
    t('three columns above 62rem', !m.stacked && !deltaBelow && m.A.w > 300 && m.B.w > 300,
      `A ${m.A.w}x${m.A.h}, B ${m.B.w}x${m.B.h}, delta ${m.delta.w}`);
  }
  t('no document scroll', m.docScroll <= 0, m.docScroll + 'px over');
  t('both plates drawn', m.canvases.length === 2 && m.canvases.every(c => +c.split('x')[0] > 100), m.canvases.join(' / '));
  log(R.join('\n'));
  await shot('mode');
  // scroll the delta to prove the list is reachable
  await page.evaluate(() => { const d = document.querySelector('.cmp__delta'); if (d) d.scrollTop = 260; });
  await page.waitForTimeout(300);
  await shot('mode-scrolled');
};
