/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const app = window.BEA || {};
    const data = app.data || window.data;
    if (!data) return { err: 'no data on window', keys: Object.keys(window).filter(k=>/app|data|store|bus/i.test(k)) };
    const out = {};
    out.bounds = data.bounds;
    const tl = data.timeline();
    out.tlmin = tl.min; out.tlmax = tl.max;
    const at = (y) => { const s = data.statusAt ? null : null; return null; };
    out.y1200 = data.metricsAt(1200);
    out.y1570 = data.metricsAt(1570);
    out.y2020 = data.metricsAt(2020);
    // which territories at 1570
    try {
      const st = data.statusAt(1570);
      const names = [];
      for (const [id, s] of (st instanceof Map ? st : Object.entries(st))) names.push(id);
      out.units1570 = names.slice(0, 40);
    } catch (e) { out.units1570err = String(e); }
    try {
      const st = data.statusAt(1200);
      const names = [];
      for (const [id, s] of (st instanceof Map ? st : Object.entries(st))) names.push(id);
      out.units1200 = names.slice(0, 40);
    } catch (e) { out.units1200err = String(e); }
    out.nextChange1856 = data.nextChangeYear(1856, 1);
    out.nextChange1856b = data.nextChangeYear(1856, -1);
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 4000));
};
