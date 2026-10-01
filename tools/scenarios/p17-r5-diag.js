/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  const run = async (tag) => {
    const r = await page.evaluate(() => {
      const m = window.__map, p = m.plate;
      const L = window.BEA.legend;
      let counted=0,missing=0,holes=0,informal=0,lost=0,other=0,tot=0;
      const modes = {};
      for (const [uid, rec] of p.paint) {
        tot++;
        modes[rec.mode||'(none)'] = (modes[rec.mode||'(none)']||0)+1;
        if (rec.mode==='hole') { holes++; continue; }
        if (rec.lost) { lost++; continue; }
        if (rec.mode==='informal') { informal++; continue; }
        if (rec.mode==='absence') missing++; else counted++;
      }
      const st = window.BEA.store.getState();
      const t = L.totalsAt(st.year);
      const def = (st.controlDefinition)||'claimed';
      return { year: st.year, def, tot, counted, missing, holes, informal, lost, modes,
        want: t.sets[def].units, sum: counted+missing+informal+holes };
    });
    log(tag + ' ' + JSON.stringify(r));
  };
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(700);
  await page.keyboard.press('2'); await page.waitForTimeout(700);
  await run('1900 def2 WSH');
  await page.evaluate(() => { location.hash = '#year=1950'; });
  await page.waitForTimeout(1500);
  await run('1950 def2 WSH');
  await page.evaluate(() => { location.hash = '#year=1620'; });
  await page.waitForTimeout(1500);
  await run('1620 def2 WSH');
};
