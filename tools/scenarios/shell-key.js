/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  const look = () => page.evaluate(() => {
    const b = (n) => { if (!n) return null; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      return { cls: String(n.className).slice(0,50), r: [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
        d: cs.display, v: cs.visibility, pos: cs.position, ibe: cs.insetBlockEnd, parent: n.parentElement ? String(n.parentElement.className).slice(0,40) : null }; };
    return {
      rail: document.getElementById('app').dataset.rail,
      slot: b(document.querySelector('[data-mount="legend"]')),
      slotKids: document.querySelector('[data-mount="legend"]').children.length,
      pin: b(document.querySelector('.legend__pin')),
      ribbon: b(document.querySelector('.legend--ribbon')),
      enlarged: b(document.querySelector('.map.is-enlarged')),
      byline: b(document.querySelector('.byline')),
    };
  });
  log('closed  ' + JSON.stringify(await look()));
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1200);
  log('open    ' + JSON.stringify(await look()));
};
