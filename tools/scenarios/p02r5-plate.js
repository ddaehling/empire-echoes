/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P02 round 5 — where the plate actually is, how much of it is covered, and
 *  how much of its canvas the drawn world fills. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const out = {};
      const stage = document.querySelector('.app__stage').getBoundingClientRect();
      const map = document.querySelector('.map').getBoundingClientRect();
      const fr = document.querySelector('.map__frame');
      const f = fr.getBoundingClientRect();
      out.stage = [Math.round(stage.width), Math.round(stage.height)];
      out.frame = [Math.round(f.left), Math.round(f.top), Math.round(f.width), Math.round(f.height)];
      out.plateOfStageW = +(f.width / stage.width).toFixed(3);
      const c = document.querySelector('.map__plate');
      out.canvasAttr = [c.width, c.height];
      // occlusion of the frame by ANY element that is not the map's own plate
      const N = 70; let hit = 0, tot = 0; const who = {};
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const x = f.left + (i + .5) * f.width / N, y = f.top + (j + .5) * f.height / N;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        tot++;
        const e = document.elementFromPoint(x, y);
        if (!e) continue;
        if (e === c || e.classList.contains('map__target') || e.classList.contains('map__frame') || e.classList.contains('map__fade')) continue;
        hit++;
        const k = e.className && e.className.baseVal !== undefined ? 'svg' : String(e.className || e.tagName).split(' ')[0];
        who[k] = (who[k] || 0) + 1;
      }
      out.occludedPct = tot ? Math.round(100 * hit / tot) : -1;
      out.occluders = Object.entries(who).sort((a, b) => b[1] - a[1]).slice(0, 5);
      // world extent inside the canvas
      const g = c.getContext('2d'); const W = c.width, H = c.height;
      const d = g.getImageData(0, 0, W, H).data;
      const hist = {};
      for (let i = 0; i < d.length; i += 4 * 17) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; hist[k] = (hist[k] || 0) + 1; }
      const sea = Object.entries(hist).sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
      let minX = W, maxX = 0, minY = H, maxY = 0, land = 0, n = 0;
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
        const i = (y * W + x) * 4; n++;
        const dist = Math.abs(d[i] - sea[0]) + Math.abs(d[i + 1] - sea[1]) + Math.abs(d[i + 2] - sea[2]);
        if (dist > 30) { land++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      out.sea = sea;
      out.worldWFracOfCanvas = +((maxX - minX) / W).toFixed(3);
      out.landFrac = +(land / n).toFixed(3);
      return out;
    });
    log(tag, JSON.stringify(r));
  };
  await probe('default');
  await shot('default');
  await page.evaluate(() => window.BEA.store.dispatch('select', 'gibraltar'));
  await page.waitForTimeout(1200);
  await probe('dossier');
  await shot('dossier');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.evaluate(() => { document.querySelector('.map__big').click(); });
  await page.waitForTimeout(1400);
  await probe('enlarged');
  await shot('enlarged');
};
