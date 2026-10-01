/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);

  // --- T3 at a 1,000px world: the minimum mark is 10px --------------------
  const mark = await page.evaluate(async () => {
    const api = window.__map;
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    const cam0 = api.plate.camera();
    const k = (1000 * api.plate.dpr) / (cam0.base * api.plate.dpr) / 1000;   // world width 1000 css px
    api.plate.setView({ k: Math.max(1, k), x: 0, y: 0 });
    api.plate.draw();
    await new Promise((r) => setTimeout(r, 200));
    const cam = api.plate.camera();
    const out = { worldPx: Math.round(cam.worldW / api.plate.dpr), minMark: Math.round(api.plate.minMark(cam) * 10) / 10, marks: {} };
    for (const u of ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island']) {
      const s = api.plate.unitScreen(u, cam);
      out.marks[u] = s ? Math.round(s.mr * 20) / 10 : null;
    }
    api.home();
    return out;
  });
  log('T3b at a ' + mark.worldPx + 'px world: minMark=' + mark.minMark + 'px; drawn mark diameters ' + JSON.stringify(mark.marks));

  // --- T6: a 1600→1997 scrub ---------------------------------------------
  const perf = await page.evaluate(async () => {
    const api = window.__map, store = window.BEA.store;
    api.plate.frames.length = 0;
    const t0 = performance.now();
    let n = 0;
    for (let y = 1600; y <= 1997; y++) {
      store.dispatch('setYear', y); store.flush();
      await new Promise((r) => requestAnimationFrame(r));
      n++;
    }
    const wall = performance.now() - t0;
    const f = api.plate.frames.slice().sort((a, b) => a - b);
    const q = (p) => (f.length ? Math.round(f[Math.floor(f.length * p)] * 100) / 100 : null);
    return { years: n, wallMs: Math.round(wall), perYearMs: Math.round((wall / n) * 100) / 100,
      drawFrames: f.length, drawMedian: q(0.5), draw95: q(0.95), drawMax: Math.round(f[f.length - 1] * 100) / 100,
      resizes: api.plate.sizeChanges, pathBuilds: api.plate.pathBuilds };
  });
  log('T6 scrub 1600→1997: ' + JSON.stringify(perf));

  // --- reduced motion: the projection change is a cross-fade -------------
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(400);
  const rm = await page.evaluate(async () => {
    const api = window.__map;
    const t = [];
    const start = performance.now();
    let fadeOn = false;
    api.setProjection('equal-earth');
    for (let i = 0; i < 40; i++) {
      t.push(api.plate.t);
      if (document.querySelector('.map__fade').classList.contains('is-on')) fadeOn = true;
      await new Promise((r) => requestAnimationFrame(r));
    }
    const tweened = t.filter((v) => v > 0.001 && v < 0.999).length;
    api.setProjection('mercator');
    await new Promise((r) => setTimeout(r, 600));
    return { tweenFrames: tweened, ms: Math.round(performance.now() - start), fadeUsed: fadeOn };
  });
  log('T4b reduced motion: intermediate tween frames=' + rm.tweenFrames + ' (0 = no tween), cross-fade layer used=' + rm.fadeUsed);
  await page.emulateMedia({ reducedMotion: null });

  // --- silences, drawn ---------------------------------------------------
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1970); window.BEA.store.flush(); window.__map.setSilenceMode(true); });
  await page.waitForTimeout(600);
  await shot('silences-1970');
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1700); window.BEA.store.flush(); });
  await page.waitForTimeout(600);
  await shot('silences-1700');
  await page.evaluate(() => { window.__map.setSilenceMode(false); window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush(); });

  // --- stitching + weight ------------------------------------------------
  await page.evaluate(() => { window.__map.setStitch(true); });
  await page.waitForTimeout(700);
  await shot('stitching-1913');
  await page.evaluate(() => { window.__map.setStitch(false); window.__map.toggleWeight(); });
  await page.waitForTimeout(700);
  await shot('weight-1913');
  await page.evaluate(() => window.__map.toggleWeight());
};
