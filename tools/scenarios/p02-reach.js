/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);
  const r = await page.evaluate(() => {
    const api = window.__map;
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    api.home();
    const cam = api.plate.camera();
    const out = { total: 0, ok: 0, stolenBy: {}, examples: [] };
    for (const [uid] of api.plate.paint) {
      const s = api.plate.unitScreen(uid, cam);
      if (!s) continue;
      out.total++;
      const got = api.pick(s.mx, s.my);
      if (got === uid) { out.ok++; continue; }
      out.stolenBy[got || 'null'] = (out.stolenBy[got || 'null'] || 0) + 1;
      if (out.examples.length < 10) out.examples.push(uid + '→' + got + (s.tiny ? ' (tiny)' : ''));
    }
    const marks = api.plate._marks;
    out.moved = marks ? marks.movedCount : null;
    out.worstShift = marks ? marks.worstShiftPx : null;
    return out;
  });
  log('REACH at home, 1913: ' + r.ok + '/' + r.total + ' drawn units resolve to themselves at their own label point.\n  moved marks=' + r.moved + ' worst shift=' + r.worstShift + 'px\n  examples: ' + JSON.stringify(r.examples) + '\n  stolen by: ' + JSON.stringify(r.stolenBy));
};
