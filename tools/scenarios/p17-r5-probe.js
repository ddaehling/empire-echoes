/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(2600);
  // Does plate.paint refresh synchronously with the store year?
  const r = await page.evaluate(async () => {
    const out = {};
    const m = window.__map;
    out.hasMap = !!m;
    out.hasPaint = !!(m && m.plate && m.plate.paint);
    const count = () => {
      const p = m.plate;
      let counted=0, missing=0, holes=0, tiny=0, tagged=0, tot=0;
      for (const [uid, rec] of p.paint) {
        tot++;
        if (rec.mode === 'hole') holes++;
        if (p.isTiny && p.isTiny(uid)) { tiny++; if (rec.stitchKind) tagged++; }
        if (rec.lost || rec.mode === 'hole' || rec.mode === 'informal') continue;
        if (rec.mode === 'absence') missing++; else counted++;
      }
      return { tot, counted, missing, holes, tiny, tagged };
    };
    out.at1900 = count();
    // now change year via store and count immediately (same tick)
    const st = window.BEA && window.BEA.store;
    out.hasStore = !!st;
    if (st) {
      st.dispatch('setYear', 1620);
      out.immediatelyAfterSetYear = count();
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      out.after2raf = count();
      await new Promise(r => setTimeout(r, 400));
      out.after400ms = count();
    }
    out.silences = m && m.silences ? m.silences.size : null;
    return out;
  });
  log(JSON.stringify(r, null, 1));
  log('ERRORS ' + JSON.stringify(errs));
};
