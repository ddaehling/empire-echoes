/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path = require('path');
module.exports = async ({ page, shot, log, outDir }) => {
  const dir = outDir || '/tmp';
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await page.evaluate(() => { document.querySelectorAll('.mount--orphan, .legend, .byline').forEach(n => n.style.display = 'none'); });
  const crop = async (uid, name, pad) => {
    const s = await page.evaluate((u) => { const q = window.__map.unitScreen(u); return q && { x: q.px, y: q.py }; }, uid);
    if (!s) { log('no unit', uid); return; }
    const p = pad || 110;
    await page.screenshot({ path: path.join(dir, name + '.png'), clip: { x: Math.max(0, s.x - p), y: Math.max(0, s.y - p), width: p * 2, height: p * 2 } });
    log('crop', name + ' at ' + Math.round(s.x) + ',' + Math.round(s.y));
  };
  await crop('gb-england', 'isles', 120);
  await crop('barbados', 'caribbean', 150);
  await crop('gibraltar', 'med', 130);
  await crop('singapore', 'sea', 130);
};
