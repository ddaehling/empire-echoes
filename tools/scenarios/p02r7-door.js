/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P02 round 7 — THE DOOR AND THE FOOT ROW.
 *
 *   D1  "Other ways to draw this" must be a real, hit-testable control from
 *       `working` onward. It used to measure 0 x 0 at `plate` AND at `working`
 *       because it was rendered INSIDE the row it opens, so the projection
 *       reveal, weight, stitching and the silences were reachable only by
 *       pressing a key documented in screen-reader-only text.
 *   D2  Projection and Weight are visible buttons at `working`.
 *   D3  The definition strip and the mode row may never overlap. They used to
 *       be two independently positioned boxes and below ~1200px they met:
 *       13,436px² at 1024x768, with elementFromPoint over the centre of the
 *       "4 influenced" segment returning the projection tile.
 *   D4  Nothing this module floats may leave the plate rectangle.
 *
 *   node tools/inspect.js tools/scenarios/p02r7-door.js --out /tmp/door --w 1024 --h 768
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1800);
  const probe = () => page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return { w: 0, h: 0 }; const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
    const strip = document.querySelector('.map__strip');
    const ctrls = document.querySelector('.map__controls');
    let ov = 0;
    if (strip && ctrls) {
      const a = strip.getBoundingClientRect(), b = ctrls.getBoundingClientRect();
      ov = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
         * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    }
    const d4 = document.querySelectorAll('.map__def')[3];
    let occ = null;
    if (d4) { const b = d4.getBoundingClientRect(); if (b.width) { const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); occ = t ? String(t.className) : null; } }
    const plate = document.querySelector('.stage__map').getBoundingClientRect();
    const off = [];
    for (const n of document.querySelectorAll('.map__strip, .map__controls, .map__zooms')) {
      const b = n.getBoundingClientRect(); if (!b.width) continue;
      if (b.top < plate.top - 1 || b.bottom > plate.bottom + 1 || b.left < plate.left - 1 || b.right > plate.right + 1) off.push(String(n.className));
    }
    const named = [...document.querySelectorAll('.map__mode')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .map(e => (e.querySelector('.map__modenow') || {}).textContent || e.getAttribute('aria-label'));
    return { stage: document.documentElement.dataset.stage, door: box('.map__modesmore'), modes: named, overlap: Math.round(ov), d4Occluder: occ, off };
  });

  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);

  const cold = await probe();
  t('D0 plate is bare        ', cold.door.w === 0 && cold.modes.length === 0, 'stage=' + cold.stage + ', door ' + cold.door.w + 'x' + cold.door.h + ', ' + cold.modes.length + ' mode buttons');

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(800);
  const work = await probe();
  t('D1 the door is reachable', work.door.w > 60 && work.door.h > 20, 'stage=' + work.stage + ', "Other ways to draw this" is ' + work.door.w + 'x' + work.door.h);
  t('D2 projection + weight  ', work.modes.length === 2 && /Merc|Equal/.test(work.modes[0] || '') && /Weight/.test(work.modes[1] || ''), JSON.stringify(work.modes));

  await page.evaluate(() => document.querySelector('.map__modesmore').click());
  await page.waitForTimeout(900);
  const app = await probe();
  t('D2b five readings       ', app.modes.length === 5, 'stage=' + app.stage + ' :: ' + JSON.stringify(app.modes));
  t('D3 no overlap           ', app.overlap === 0 && !/map__mode/.test(app.d4Occluder || ''), app.overlap + 'px², "4 influenced" is under ' + app.d4Occluder);
  t('D4 nothing off the plate', app.off.length === 0, app.off.join(' | ') || 'all inside the plate rect');

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> P02 DOOR VIOLATED' : '>>> the door holds');
  await shot('door');
};
