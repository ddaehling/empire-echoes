/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const g = await page.evaluate(() => {
    const box = s => { const n = document.querySelector(s); if (!n) return s + ': MISSING';
      const r = n.getBoundingClientRect(); return `${s}: ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`; };
    const app = document.getElementById('app');
    return {
      boxes: ['#app','.app__bar','.app__stage','.app__time','.time__slot','.tl','.tl__deck','.tl__body','.tl-ax','.tl-ax__rail','.tl-spine__track','.tl-lane[data-phase="atlantic"]','.app__foot','.app__overlay'].map(box),
      appHidden: app.hidden, appAttrs: [...app.attributes].map(a=>a.name+'='+a.value),
      html: document.documentElement.dataset.boot,
      overlayKids: [...document.querySelector('.app__overlay').children].map(c=>c.getAttribute('data-mount')||c.className),
      timeSlotHTML: document.querySelector('.time__slot').innerHTML.slice(0,200),
    };
  });
  log(JSON.stringify(g, null, 1));
  await shot('geom');
};
