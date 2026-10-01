/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const bad = await page.evaluate(async () => {
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    const out = [];
    const terrs = window.BEA.data.territories;
    for (const t of terrs) {
      const acqs = (t.acquisitions||[]).filter(a=>a.year!=null).sort((a,b)=>a.year-b.year);
      const deps = (t.departures||[]).filter(d=>d.year!=null && d.mechanism!=='still-a-territory').sort((a,b)=>a.year-b.year);
      if (acqs.length < 2 || !deps.length) continue;
      const y = deps[0].year + 1;
      if (y > 2027) continue;
      // only if last acq at/before y is after? just check render
      window.BEA.store.act.setYear(y);
      window.BEA.store.act.select(t.id);
      await sleep(35);
      const el = document.querySelector('.app__dossier');
      const txt = el ? el.innerText : '';
      const m = txt.match(/IN FORCE IN (\d+)([^\n]*)/);
      if (m) out.push([t.id, y, deps[0].year, deps[0].mechanism, m[0].slice(0,120)]);
      if (out.length > 40) break;
    }
    return out;
  });
  log('COUNT with IN FORCE after first departure:', bad.length);
  for (const b of bad) log('  ', JSON.stringify(b));
};
