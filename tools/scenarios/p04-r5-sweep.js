/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — a broad sweep: every region, several years, looking for
 * errors, empty panels, missing folds and above-fold failures. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const ids = await page.evaluate(() => window.BEA.data.territories.map((t) => t.id));
  const pick = [];
  for (let i = 0; i < ids.length; i += 5) pick.push(ids[i]);
  const bad = [];
  let checked = 0, withTest = 0, absence = 0, defects = 0;
  for (const id of pick) {
    await page.evaluate((x) => { location.hash = '#sel=' + x; }, id);
    await page.waitForTimeout(320);
    const r = await page.evaluate(() => {
      const root = document.querySelector('.app__dossier');
      const box = root.getBoundingClientRect();
      const bl = (s) => { const n = document.querySelector(s); return n ? Math.round(n.getBoundingClientRect().bottom) : null; };
      return {
        name: (document.querySelector('.dsr__name') || {}).textContent,
        h: Math.round(box.height), bottom: Math.round(box.bottom),
        status: bl('#dsr-status'), taken: bl('#dsr-taken'), ended: bl('#dsr-ended'),
        prim: root.querySelectorAll('figure.src[data-primary="yes"]').length,
        abs: !!root.querySelector('.dsr__absence'),
        defect: root.querySelectorAll('.defect').length,
        folds: root.querySelectorAll('details.dsr__ext').length,
        empty: !!root.querySelector('.dossier--empty'),
      };
    });
    checked++;
    if (r.prim) withTest++;
    if (r.abs) absence++;
    defects += r.defect;
    for (const k of ['status', 'taken', 'ended']) {
      if (r[k] != null && r[k] > r.bottom) bad.push(id + ' ' + k + ' ' + r[k] + ' > ' + r.bottom);
    }
    if (r.empty) bad.push(id + ' EMPTY PANEL');
  }
  log('checked ' + checked + ' territories · with a primary text ' + withTest + ' · showing the absence mark ' + absence + ' · total defect marks ' + defects);
  log('above-fold failures: ' + (bad.length ? JSON.stringify(bad) : 'none'));
  await shot('sweep-last');
};
