/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const m = window.__map;
    const out = { year: window.BEA.store.getState().year, ghosts: [], labels: m.labels };
    for (const [uid, rec] of m.plate.paint) if (rec.lost) out.ghosts.push(uid);
    out.ghostCount = out.ghosts.length;
    out.sample = [];
    for (const uid of out.ghosts.slice(0, 4)) {
      m.plate.hover = null;
      m.module._setHover(uid);
      const t = document.querySelector('.map__tip');
      out.sample.push({ uid, hidden: t.hidden, text: t.innerText.replace(/\s+/g, ' ').slice(0, 260) });
    }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 2600));
};
