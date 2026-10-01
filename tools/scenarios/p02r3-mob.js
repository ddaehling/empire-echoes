/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'textContent').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const o = await page.evaluate(() => {
    const m = window.__map;
    const r = m.module.el.getBoundingClientRect();
    return { plate: [Math.round(r.width), Math.round(r.height)], insets: m.plate.insets,
      obstacles: m.obstacles().length, minMark: m.plate.minMark(), labels: m.labels.length,
      cardH: document.querySelector('.map__switch').getBoundingClientRect().height,
      clipped: document.querySelector('.map__switch').classList.contains('is-clipped'),
      more: document.querySelector('.map__more').textContent };
  });
  log(JSON.stringify(o));
  await shot('mobile');
  // is the map operable? tap the middle of the free paper
  const hit = await page.evaluate(() => {
    const m = window.__map; const r = m.module.el.getBoundingClientRect();
    const out = [];
    for (const [x, y] of [[195, 60], [120, 100], [300, 150], [195, 250]]) {
      const t = document.elementFromPoint(Math.round(r.left + x), Math.round(r.top + y));
      out.push([x, y, t ? t.tagName + '.' + String(t.className||'').split(' ')[0] : 'none']);
    }
    return out;
  });
  log('TAPS: ' + JSON.stringify(hit));
  await page.keyboard.press('w'); await page.waitForTimeout(600); await shot('mobile-weight');
  await page.keyboard.press('w'); await page.keyboard.press('h'); await page.waitForTimeout(600); await shot('mobile-silence');
};
