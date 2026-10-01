/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 9 — rules B2 and B5 with the rail OPEN, which is the only state
 * this piece can break. B2's floor is stated to hold with the rail open; B5
 * says a panel compresses the map and never covers it. Measured, not assumed.
 */
const FLOOR = {
  390: [360, 150], 800: [360, 150], 1024: [740, 300],
  1366: [1000, 420], 1440: [1100, 470], 1920: [1500, 620],
};
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2400);
  const m = await page.evaluate(() => {
    const map = document.querySelector('.stage__map');
    const aside = document.querySelector('.app__dossier');
    const stage = document.querySelector('.app__stage');
    const r = (n) => { const b = n.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const mr = map.getBoundingClientRect(), ar = aside.getBoundingClientRect();
    const ov = Math.max(0, Math.min(mr.right, ar.right) - Math.max(mr.left, ar.left))
      * Math.max(0, Math.min(mr.bottom, ar.bottom) - Math.max(mr.top, ar.top));
    const canvas = map.querySelector('canvas, svg');
    return {
      vw: innerWidth, vh: innerHeight,
      map: r(map), stage: r(stage), rail: r(aside),
      canvas: canvas ? r(canvas) : null,
      overlapPx2: Math.round(ov),
      dossierPosition: getComputedStyle(aside).position,
      docScroll: document.documentElement.scrollHeight - innerHeight,
    };
  });
  const floor = FLOOR[m.vw] || [0, 0];
  const b2 = m.map.w >= floor[0] && m.map.h >= floor[1];
  /* B5 exempts the phone: under 62rem the shell makes the rail a bottom sheet
     over the stage on purpose (layout.css), so the overlap there is the
     shell's design, not this panel's trespass. */
  const b5 = m.vw > 62 * 16 ? m.overlapPx2 <= 4000 : true;
  log('RAIL-OPEN ' + m.vw + 'x' + m.vh + ' :: ' + JSON.stringify(m));
  log('B2 (floor ' + floor.join('x') + ') -> ' + (b2 ? 'PASS' : 'FAIL'));
  log('B5 (overlap ' + m.overlapPx2 + 'px2) -> ' + (b5 ? 'PASS' : 'FAIL (or shell-owned bottom sheet)'));
  log('B4 (doc scroll ' + m.docScroll + ') -> ' + (m.docScroll <= 0 ? 'PASS' : 'FAIL'));
  await shot('rail-open');
};
