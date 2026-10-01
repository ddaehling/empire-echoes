/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1948));
  await page.waitForTimeout(250);
  await shot('tl');
  await shot('tl-el', '.tl');
  const contrast = await page.evaluate(() => {
    const g = (el, p) => getComputedStyle(el)[p];
    const off = document.querySelector('.tl-lane[data-on="false"]');
    const on = document.querySelector('.tl-lane[data-on="true"]');
    const card = document.querySelector('.tl-chg');
    return {
      laneOffBg: off && g(off, 'backgroundColor'), laneOffColor: off && g(off, 'color'), laneOffBorder: off && g(off, 'borderTopColor'),
      laneOnBg: on && g(on, 'backgroundColor'), laneOnColor: on && g(on, 'color'),
      cardBg: card && g(card, 'backgroundColor'), cardColor: card && g(card, 'color'),
      how: card && g(card.querySelector('.tl-chg__how'), 'color'),
      page: g(document.body, 'backgroundColor'),
    };
  });
  log(JSON.stringify(contrast, null, 1));
  const geom = await page.evaluate(() => {
    const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const cards = [...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].filter(c=>!c.hidden).map(c => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
    return { tl: q('.tl'), count: q('.tl__count'), more: q('.tl-chg--more'), track: q('.tl__track'), cards, vw: innerWidth };
  });
  log('geom ' + JSON.stringify(geom));
};
