/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const snap = async (tag) => {
    const m = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const frame = R(q('.map__frame'));
      const grid = 60; let hit = 0, tot = 0; const by = {};
      if (frame) for (let i = 0; i < grid; i++) for (let j = 0; j < grid; j++) {
        const x = frame.x + (i + .5) * frame.w / grid, y = frame.y + (j + .5) * frame.h / grid;
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        tot++;
        const e = document.elementFromPoint(x, y); if (!e) continue;
        if (e.classList && ['map__plate','map__fade','map__target','map__targets','map__frame'].some(c => e.classList.contains(c))) continue;
        let n = e, op = null;
        while (n && n !== document.body) { const bg = getComputedStyle(n).backgroundColor; if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { op = n; break; } n = n.parentElement; }
        if (op) { hit++; const k = String(op.className || op.tagName).split(' ')[0]; by[k] = (by[k]||0)+1; }
      }
      const big = q('.map__big');
      return { vw: innerWidth, vh: innerHeight, frame, mapEl: R(q('.map')), rail: R(q('.map__furniture')),
        enlarged: !!(q('.map') && q('.map').classList.contains('is-enlarged')),
        bigText: big ? big.innerText.replace(/\n/g,' / ') : null, urgent: big ? big.classList.contains('is-urgent') : null,
        timeVisible: (() => { const t = R(q('.app__time')); if (!t) return null; const m2 = R(q('.map')); if (!m2) return t;
          return { time: t, hidden: Math.max(0, Math.min(t.y + t.h, m2.y + m2.h) - Math.max(t.y, m2.y)) }; })(),
        occl: tot ? +(hit/tot).toFixed(3) : null, by, sel: window.BEA.store.getState().selectedTerritoryId };
    });
    log(tag + ' ' + JSON.stringify(m));
    await shot(tag);
  };
  await snap('docked');
  await page.keyboard.press('e');
  await page.waitForTimeout(1200);
  await snap('enlarged');
  // select something while enlarged
  await page.evaluate(() => window.BEA.store.dispatch('select', 'bengal'));
  await page.waitForTimeout(1200);
  await snap('enlarged-dossier');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  await snap('back');
};
