/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js').catch(e => null);
    if (!mod) return {err:'no data module at that path'};
    const data = mod.default || mod.data || mod;
    const out = {keys: Object.keys(data).slice(0,40)};
    try { out.bounds = data.bounds; } catch(e){}
    try { out.next1856 = data.nextChangeYear(1856, 1); out.prev1856 = data.nextChangeYear(1856,-1); } catch(e){ out.nErr = String(e); }
    try { out.next1900 = data.nextChangeYear(1900,1); } catch(e){}
    try { const t = data.timeline(); out.tl = Object.keys(t); out.cuts = (t.cuts||[]).slice(0,10); out.nEvents=(t.events||[]).length; } catch(e){ out.tlErr=String(e); }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
