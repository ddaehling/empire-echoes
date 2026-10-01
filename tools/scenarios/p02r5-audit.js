/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const m = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const stage = R(q('.app__stage')), frame = R(q('.map__frame'));
    // occlusion grid over the frame
    const grid = 60; let hit = 0, tot = 0; const by = {};
    if (frame) for (let i = 0; i < grid; i++) for (let j = 0; j < grid; j++) {
      const x = frame.x + (i + .5) * frame.w / grid, y = frame.y + (j + .5) * frame.h / grid;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      tot++;
      const e = document.elementFromPoint(x, y);
      if (!e) continue;
      const inMap = q('.map') && (q('.map').contains(e));
      const isCanvas = e.classList && (e.classList.contains('map__plate') || e.classList.contains('map__fade') || e.classList.contains('map__target') || e.classList.contains('map__targets') || e.classList.contains('map__frame'));
      if (!isCanvas) {
        // Only count something that actually PAINTS over the plate.
        let n = e, opaque = null;
        while (n && n !== document.body) {
          const cs = getComputedStyle(n);
          const bg = cs.backgroundColor;
          if (bg && bg !== 'transparent' && !/rgba\(0, 0, 0, 0\)/.test(bg)) { opaque = n; break; }
          n = n.parentElement;
        }
        if (opaque && !(q('.map') && q('.map').contains(opaque))) {
          hit++;
          const k = (opaque.className && String(opaque.className).split(' ')[0]) || opaque.tagName;
          by[k] = (by[k] || 0) + 1;
        } else if (opaque) { hit++; const k='SELF:'+(String(opaque.className).split(' ')[0]||opaque.tagName); by[k]=(by[k]||0)+1; }
      }
    }
    return {
      vw: innerWidth, vh: innerHeight, stage, frame,
      frameOfStageW: frame && stage ? +(frame.w / stage.w).toFixed(3) : null,
      occl: tot ? +(hit / tot).toFixed(3) : null, occluders: by,
      railDock: q('.map__furniture') && q('.map__furniture').dataset.dock,
      railMode: q('.map__furniture') && q('.map__furniture').dataset.railmode,
      rail: R(q('.map__furniture')),
    };
  });
  log(JSON.stringify(m));
  await shot('state');
};
