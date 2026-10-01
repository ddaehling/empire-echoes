/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 3 — does the fold fit, on every territory, at 1280x800? */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  const ids = await page.evaluate(() => (window.BEA && window.BEA.data ? window.BEA.data.territories.map((t) => t.id) : []));
  log('territories seen by the page:', ids.length);

  const probe = await page.evaluate(async () => {
    const store = window.BEA.store;
    const data = window.BEA.data;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const bad = [];
    const missingActors = [];
    let noFranchise = 0, withThink = 0, n = 0;
    const list = data.territories;
    for (const t of list) {
      const years = [];
      if (t.firstYear != null) years.push(t.firstYear + 1);
      const mid = t.firstYear != null && t.lastYear != null ? Math.round((t.firstYear + t.lastYear) / 2) : null;
      if (mid) years.push(mid);
      if (t.lastYear != null) years.push(t.lastYear - 1);
      if (!years.length) years.push(1913);
      for (const y of years) {
        store.batch((d) => { d('setYear', Math.max(1600, Math.min(2027, y))); d('select', t.id); });
        await sleep(0);
        const host = document.querySelector('.app__dossier');
        const fold = document.querySelector('.dsr__fold');
        const art = document.querySelector('.dossier');
        if (!host || !fold || !art) continue;
        n++;
        const hb = host.getBoundingClientRect(), fb = fold.getBoundingClientRect();
        const over = Math.round(fb.bottom - hb.bottom);
        if (over > 0) bad.push({ id: t.id, y, over });
        if (art.querySelector('.dsr__missing')) missingActors.push(t.id);
        if (!art.querySelector('.dsr__franchise')) noFranchise++;
        if (art.querySelector('.dsr__think')) withThink++;
      }
    }
    return { n, bad: bad.sort((a, b) => b.over - a.over).slice(0, 25), overCount: bad.length, missingActors: [...new Set(missingActors)], noFranchise, withThink };
  });
  log('SWEEP', JSON.stringify({ ...probe, missingActors: probe.missingActors.slice(0, 20), missingCount: probe.missingActors.length }, null, 1));
  log('PAGE ERRORS', errs.length, JSON.stringify(errs.slice(0, 5)));
};
