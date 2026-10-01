/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P02 — the acceptance the round-3 critic set: after pressing "Whole world",
// every unit target must be on the plate and not under anybody's panel.
const stage = require('./p02-stage.js');

module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  const sizes = [[1366,768],[1280,800],[1440,900],[1920,1080],[390,844]];
  for (const [w, h] of sizes) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(2000);
    const capped = await stage(page);
    if (capped) log('  [harness] timeline capped to 354px so the stage is not 0px tall');
    await page.waitForTimeout(600);
    await page.click('.map__zoom--home').catch(() => {});
    await page.waitForTimeout(900);
    const d = await page.evaluate(() => {
      const m = document.querySelector('.map');
      const mb = m.getBoundingClientRect();
      const api = window.__map || (window.BEA && window.BEA.map) || null;
      const opts = [...document.querySelectorAll('.map__targets [role="option"]')];
      const off = [], blocked = [], byOwnOption = [];
      for (const o of opts) {
        const b = o.getBoundingClientRect();
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        if (cx < mb.left + 1 || cx > mb.right - 1 || cy < mb.top + 1 || cy > mb.bottom - 1) { off.push(o.dataset.unit); continue; }
        const hit = document.elementFromPoint(cx, cy);
        if (!hit) { blocked.push([o.dataset.unit, 'null']); continue; }
        if (hit.classList.contains('map__plate') || hit === o || o.contains(hit)) continue;
        if (hit.closest('.map__targets')) { byOwnOption.push(o.dataset.unit); continue; }
        blocked.push([o.dataset.unit, hit.className || hit.tagName]);
      }
      const ctl = {};
      for (const sel of ['.map__proj', '.map__stitch', '.map__weight', '.map__silence', '.map__zoom--home', '.map__more']) {
        const n = document.querySelector(sel);
        if (!n) { ctl[sel] = 'MISSING'; continue; }
        const b = n.getBoundingClientRect();
        if (b.width < 2 || b.height < 2) { ctl[sel] = 'ZERO'; continue; }
        const pts = [[b.x + b.width / 2, b.y + b.height / 2], [b.x + 4, b.y + 4], [b.right - 4, b.bottom - 4]];
        const bad = [];
        for (const [x, y] of pts) { const e = document.elementFromPoint(x, y); if (!e || !n.contains(e) && e !== n) bad.push(e ? (e.className || e.tagName) : 'null'); }
        ctl[sel] = (bad.length ? 'BLOCKED:' + bad.join('|') : 'OK') + ` ${Math.round(b.width)}x${Math.round(b.height)}`;
      }
      return {
        plate: [Math.round(mb.width), Math.round(mb.height)],
        insets: api && api.plate ? api.plate.insets : null,
        fitChoice: api ? api.fitChoice : null,
        world: api && api.plate ? Math.round(api.plate.camera().worldW / api.plate.dpr) : null,
        marks: api && api.plate ? { moved: (api.plate._marks && api.plate._marks.movedCount) || 0, worst: (api.plate._marks && api.plate._marks.worstShiftPx) || 0 } : null,
        opts: opts.length, off, blocked, byOwnOption: byOwnOption.length, ctl,
      };
    });
    log(`${w}x${h} plate=${d.plate} world=${d.world} fit=${d.fitChoice} insets=${JSON.stringify(d.insets)}
   targets=${d.opts} OFF=${d.off.length} ${JSON.stringify(d.off.slice(0,12))} BLOCKED=${d.blocked.length} ${JSON.stringify(d.blocked.slice(0,10))} overlappedByOtherOption=${d.byOwnOption}
   marks=${JSON.stringify(d.marks)}  controls=${JSON.stringify(d.ctl)}`);
    await shot(`fit-${w}x${h}`);
  }
};
