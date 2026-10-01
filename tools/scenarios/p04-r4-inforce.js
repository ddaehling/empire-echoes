/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: exits 1.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 4: sweep every territory for the in-force contradiction the
   critic disqualified us on — an "IN FORCE IN <year>" line printed on a panel
   that also says Britain held nothing there that year, or after a departure. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(800);

  const bad = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const out = [];
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const years = [1857, 1900, 1922, 1947, 1956, 1961, 1964, 1971, 1997, 2020];
    for (const t of data.territories) {
      for (const y of years) {
        store.dispatch('setYear', y);
        store.dispatch('select', t.id);
        store.flush();
        await wait();
        const root = document.querySelector('.dossier');
        if (!root) continue;
        const txt = root.innerText;
        const inForce = /IN FORCE IN \d{4}/i.test(txt);
        if (!inForce) continue;
        const nothing = /Britain held nothing here in/i.test(txt);
        const at = data.territoryAt(t.id, y);
        const held = !!(at && at.span);
        const dep = (t.departures || []).find(d => d.year != null && d.year <= y);
        if (nothing || !held || dep) {
          out.push({ id: t.id, year: y, nothing, held, dep: dep ? dep.year : null });
        }
      }
    }
    return out;
  });
  log('CONTRADICTIONS: ' + bad.length);
  log(JSON.stringify(bad.slice(0, 30), null, 1));
  log('ERRORS: ' + JSON.stringify(errs.slice(0, 10)));
};
