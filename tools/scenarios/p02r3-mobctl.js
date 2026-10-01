/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const o = await page.evaluate(() => {
    const out = [];
    for (const sel of ['.map__zoom[aria-label="Zoom in"]', '.map__zoom[aria-label="Zoom out"]', '.map__zoom--home', '.map__weight', '.map__silence', '.map__stitch', '.map__proj']) {
      const n = document.querySelector(sel);
      if (!n) { out.push([sel, 'missing']); continue; }
      const b = n.getBoundingClientRect();
      const t = document.elementFromPoint(Math.round(b.left + b.width/2), Math.round(b.top + b.height/2));
      out.push([sel, Math.round(b.width) + 'x' + Math.round(b.height), n.contains(t) || t === n ? 'reachable' : 'BLOCKED by ' + (t ? t.tagName + '.' + String(t.className||'').split(' ')[0] : 'none')]);
    }
    return out;
  });
  for (const r of o) log(JSON.stringify(r));
  await shot('mobile-controls');
};
