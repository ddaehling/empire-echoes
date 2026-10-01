/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2000);
  const probe = async (hash) => {
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForTimeout(1400);
    return await page.evaluate(() => {
      const app = window.__app || window.app || {};
      const data = app.data || window.data;
      const targets = [...document.querySelectorAll('.map__target')];
      const out = { hash: location.hash, drawn: targets.length,
        ariaPlate: document.querySelector('.map__plate')?.getAttribute('aria-label'),
        defAttr: document.querySelector('.map')?.dataset.definition };
      try {
        const m = data.metricsAt(2 && +(new URLSearchParams(location.hash.slice(1)).get('year')||1913));
        out.metrics = JSON.parse(JSON.stringify(m)).byDegree ? {byDegree: m.byDegree} : Object.keys(m);
      } catch(e) { out.metricsErr = String(e); }
      return out;
    });
  };
  for (const h of ['#year=1913&def=claimed','#year=1913&def=administered','#year=1913&def=controlled','#year=1913&def=influenced']) {
    const r = await probe(h);
    log(h, JSON.stringify(r).slice(0,1500));
    await shot('def-' + h.split('def=')[1]);
  }
  log('globals:', await page.evaluate(() => Object.keys(window).filter(k=>/app|data|store|bus|atlas/i.test(k)).join(',')));
};
