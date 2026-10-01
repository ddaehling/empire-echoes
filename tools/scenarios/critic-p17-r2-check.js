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
    const d = window.BEA.data;
    const s = d.statusAt(1900);
    const out = { condominium: [], leased: [], occupied: [], informal: [] };
    for (const [uid, v] of (s instanceof Map ? s.entries() : Object.entries(s))) {
      if (v && v.status === 'condominium') out.condominium.push(uid);
      if (v && v.status === 'leased-territory') out.leased.push(uid);
      if (v && v.status === 'occupied') out.occupied.push(uid);
      if (v && v.status === 'informal-sphere') out.informal.push(uid);
    }
    return out;
  });
  log(JSON.stringify(r,null,1));
};
