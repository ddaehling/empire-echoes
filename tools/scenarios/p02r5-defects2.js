/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const go = async (y) => { await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y); await page.waitForTimeout(700); };
  await go(1900);
  log('probe ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map;
    const one = (id) => {
      const s = m.unitScreen(id);
      if (!s) return { id, screen: null };
      m.hoverAt(s.px, s.py);
      const tip = document.querySelector('.map__tip');
      return { id, at: [Math.round(s.px), Math.round(s.py)], pick: m.pick(s.px, s.py),
        tip: tip && !tip.hidden ? tip.innerText.replace(/\n/g, ' | ').slice(0, 260) : null };
    };
    return ['hawaii', 'us-florida', 'gibraltar', 'malta', 'ascension', 'barbados', 'singapore', 'hk-hong-kong-island', 'ye-aden-colony'].map(one);
  }), null, 1));
  await go(1913);
  log('1913 tiny ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map;
    return ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'].map(id => {
      const t = document.querySelector('.map__target[data-unit="' + id + '"]');
      const s = m.unitScreen(id);
      const r = t && t.getBoundingClientRect();
      return { id, painted: m.plate.paint.has(id), target: r ? [Math.round(r.width), Math.round(r.height)] : null,
        pickAtMark: s ? m.pick(s.mx, s.my) : null, tabindex: t && t.getAttribute('tabindex'), label: t && t.getAttribute('aria-label') };
    });
  }), null, 1));
};
