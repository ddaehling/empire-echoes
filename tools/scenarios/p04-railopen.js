/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** B2 and B5 with the rail open — the dossier is one of the two surfaces in it. */
const FLOOR = { '1920x1080': [1500, 620], '1440x900': [1100, 470], '1366x768': [1000, 420], '1024x640': [740, 300], '390x844': [360, 150] };
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => { location.hash = '#year=1900&sel=egypt'; });
  await page.waitForTimeout(2000);
  const m = await page.evaluate(() => {
    const B = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const stage = B('.app__stage'), key = B('.stage__key');
    const map = B('.stage__map canvas') || B('.stage__map svg');
    const plate = { l: stage.x, t: stage.y, r: stage.x + stage.w, b: stage.y + stage.h - (key ? key.h : 0) };
    const intruders = [];
    for (const e of document.querySelectorAll('#app *')) {
      const cs = getComputedStyle(e);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue;
      if (cs.backgroundColor === 'rgba(0, 0, 0, 0)' && !String(e.className).includes('panel')) continue;
      if (e.closest('.stage__map') || e.closest('.stage__over') || e.closest('.app__overlay')) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const ox = Math.max(0, Math.min(r.right, plate.r) - Math.max(r.left, plate.l));
      const oy = Math.max(0, Math.min(r.bottom, plate.b) - Math.max(r.top, plate.t));
      if (ox * oy > 4000) intruders.push(String(e.className).slice(0, 40) + ' ' + Math.round(ox * oy) + 'px2');
    }
    const d = document.querySelector('.app__dossier');
    return { vp: innerWidth + 'x' + innerHeight, map, rail: B('.app__dossier'), stage,
      docScroll: document.documentElement.scrollHeight - innerHeight,
      dossierScrolls: d ? d.scrollHeight > d.clientHeight : false,
      intruders: intruders.slice(0, 6),
      sheetOpen: document.getElementById('app').dataset.sheet };
  });
  const f = FLOOR[m.vp] || FLOOR['1366x768'];
  const R = [];
  R.push((m.map && m.map.w >= f[0] && m.map.h >= f[1] ? 'PASS' : 'FAIL') + '  B2 drawn map WITH THE RAIL OPEN  got ' + (m.map ? m.map.w + 'x' + m.map.h : 'none') + '  (>= ' + f.join('x') + ')');
  R.push((m.intruders.length === 0 ? 'PASS' : 'FAIL') + '  B5 nothing stands on the plate  got ' + (m.intruders.join(' | ') || 'clear'));
  R.push((m.docScroll <= 0 ? 'PASS' : 'FAIL') + '  B4 no document scroll  got ' + m.docScroll + 'px over');
  log('MEASURED ' + JSON.stringify(m));
  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> RAIL VIOLATED' : '>>> rail holds');
  await shot('rail-open');
};
