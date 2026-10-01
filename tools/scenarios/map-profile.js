/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  log(JSON.stringify(await page.evaluate(() => {
    const m = window.__map, p = m.plate;
    const time = (label, fn, n = 12) => { const t0 = performance.now(); for (let i = 0; i < n; i++) fn(); return { [label]: +((performance.now() - t0) / n).toFixed(2) }; };
    const out = {};
    p.moving = true;
    Object.assign(out, time('morphFrame', () => { p.setProjectionState('equal-earth', 'mercator', 0.4 + Math.random() * 0.2); p.draw(); }));
    Object.assign(out, time('baseOnly', () => { p.setProjectionState('equal-earth', 'mercator', 0.4 + Math.random() * 0.2); p._drawBase(p.camera()); }));
    Object.assign(out, time('pathsOnly', () => { p.setProjectionState('equal-earth', 'mercator', 0.4 + Math.random() * 0.2); p.paths(p.camera()); }));
    p.setProjectionState('equal-earth', 'equal-earth', 1);
    p._pathSig = ''; p.draw();
    Object.assign(out, time('staticFrame', () => p.draw()));
    // static frame without textures
    const pat = p.pat; const stripped = {}; for (const k of Object.keys(pat)) stripped[k] = (k === 'bandsFor') ? pat[k] : null;
    p.pat = stripped;
    Object.assign(out, time('staticNoTexture', () => p.draw()));
    p.pat = pat; p.draw();
    return out;
  }), null, 1));
};
