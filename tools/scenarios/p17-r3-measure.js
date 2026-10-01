/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 3 — ground-truth measurement of the height budget and the key. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const m = await page.evaluate(() => {
    const box = (sel) => { const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect();
      return { y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width),
               ch: e.clientHeight, sh: e.scrollHeight }; };
    const body = document.querySelector('#legend-body');
    let visRows = 0, totalRows = 0;
    if (body) {
      const br = body.getBoundingClientRect();
      const rows = body.querySelectorAll('.legend__row, .legend__family-head');
      totalRows = rows.length;
      for (const r of rows) { const rr = r.getBoundingClientRect();
        if (rr.bottom > br.top + 2 && rr.top < br.bottom - 2) visRows++; }
    }
    // how many swatches are actually visible on screen anywhere
    let visSwatch = 0;
    for (const s of document.querySelectorAll('.legend .sym')) {
      const r = s.getBoundingClientRect();
      const host = s.closest('#legend-body, .legend__marksfix, .legend');
      const hr = host ? host.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      if (r.height > 4 && r.top >= hr.top - 2 && r.bottom <= hr.bottom + 2 && r.bottom > 0 && r.top < innerHeight) visSwatch++;
    }
    const metrics = window.BEA && window.BEA.data ? window.BEA.data.metricsAt(window.BEA.store.getState().year) : null;
    return {
      viewport: [innerWidth, innerHeight],
      stage: box('.app__stage'),
      note: box('.stage__note'),
      byline: box('#legend-byline'),
      legendSlot: box('.stage__legend'),
      legend: box('.legend'),
      head: box('.legend__head'),
      bodywrap: box('#legend-body'),
      marksfix: box('.legend__marksfix'),
      tight: document.querySelector('.stage__legend') && document.querySelector('.stage__legend').dataset.tight,
      visRows, totalRows, visSwatch,
      metrics: metrics && { units: metrics.units, controlledUnits: metrics.controlledUnits, byDegree: metrics.byDegree },
      bylineText: (document.querySelector('#legend-byline') || {}).innerText,
    };
  });
  log(JSON.stringify(m, null, 1));
  await shot('01-default');
};
