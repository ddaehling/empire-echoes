/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'scrollIntoView').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Is the T11 teaching move visible where a student actually stands? */
const fs = require('fs');
const { PNG } = (() => { try { return require('pngjs'); } catch (_) { return {}; } })();

module.exports = async ({ page, shot, log, outDir }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await page.evaluate(() => {
    for (const s of ['.stage__over', '.stage__legend', '.stage__note']) {
      const n = document.querySelector(s); if (n) n.style.visibility = 'hidden';
    }
    document.querySelector('#dsr-nested').scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(400);
  const clip = await page.evaluate(() => {
    const r = document.querySelector('.stage__map').getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
  });
  const shots = [];
  const grab = async (name) => {
    const p = outDir + '/' + name + '.png';
    await page.screenshot({ path: p, clip });
    shots.push(p); log('wrote ' + p);
  };
  await grab('a-before');
  await page.click('[data-act="paint-direct"]');
  await page.waitForTimeout(1000);
  await grab('b-direct');
  await page.click('[data-act="paint-children"]');
  await page.waitForTimeout(1000);
  await grab('c-states');

  if (PNG) {
    const read = (p) => PNG.sync.read(fs.readFileSync(p));
    const a = read(shots[1]), b = read(shots[2]);
    let diff = 0, n = 0;
    for (let i = 0; i < a.data.length; i += 4) {
      n++;
      const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
      if (d > 24) diff++;
    }
    log('PIXELS CHANGED between the two paints: ' + (100 * diff / n).toFixed(1) + '% of the map area');
  } else {
    log('pngjs not available; compare the two PNGs by eye');
  }
  await shot('d-full');
};
