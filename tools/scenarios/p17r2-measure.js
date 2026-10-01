/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2600);
  await shot('landing');

  const m = await page.evaluate(() => {
    const box = (sel) => { const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               ch: e.clientHeight, sh: e.scrollHeight }; };
    return {
      docH: document.documentElement.scrollHeight,
      vh: innerHeight, vw: innerWidth,
      app: box('.app'), stage: box('.app__stage'), dossier: box('.app__dossier'),
      dsrProse: box('.dsr__prose'), dossierBody: box('.dossier__body'),
      time: box('.app__time'), foot: box('.app__foot'),
      slotLegend: box('.stage__legend'), legend: box('.legend'),
      bodywrap: box('.legend__bodywrap'),
      note: box('.stage__note'), byline: box('#legend-byline'),
      crit: box('#legend-criticism'),
      rows: document.querySelectorAll('.legend__entry').length,
      units: document.querySelectorAll('[data-unit]').length,
    };
  });
  log(JSON.stringify(m, null, 1));

  const totals = await page.evaluate(() => {
    const B = window.BEA; if (!B || !B.data) return 'no BEA.data';
    const out = {};
    for (const y of [1913, 1922, 1947]) {
      const mm = B.data.metricsAt(y);
      out[y] = { units: mm.units, controlledUnits: mm.controlledUnits, territories: mm.territories };
      // count informal at that year
      let inf = 0, deg1 = 0, deg1NotInf = 0, ctrl = 0;
      for (const e of B.data.statusAt(y).values()) {
        if (e.status === 'informal-sphere') inf++;
        if (e.controlDegree >= 1) deg1++;
        if (e.controlDegree >= 1 && e.status !== 'informal-sphere') deg1NotInf++;
        if (e.controlled) ctrl++;
      }
      out[y].informal = inf; out[y].deg1 = deg1; out[y].deg1NotInf = deg1NotInf; out[y].ctrlFlag = ctrl;
    }
    return out;
  });
  log('TOTALS ' + JSON.stringify(totals, null, 1));
  log('ERRORS ' + JSON.stringify(errs));
};
