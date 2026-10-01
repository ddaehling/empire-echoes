/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  for (const [w, h] of [[1440, 900], [1000, 820]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(900);
    const out = await page.evaluate(() => {
      const m = window.__map, el = document.querySelector('.map');
      const r = el.getBoundingClientRect();
      const boxes = [];
      for (const n of document.querySelectorAll('#app [data-mount]')) {
        if (el.contains(n) || n.contains(el)) continue;
        const cs = getComputedStyle(n); const b = n.getBoundingClientRect();
        boxes.push({ mount: n.dataset.mount, pe: cs.pointerEvents, box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] });
      }
      const cam = m.plate.camera();
      return { plate: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], insets: m.plate.insets, avail: [Math.round(cam.availW), Math.round(cam.availH)], boxes };
    });
    log('viewport ' + w + 'x' + h, JSON.stringify(out, null, 1));
  }
};
