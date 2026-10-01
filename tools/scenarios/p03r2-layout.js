/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const m = await page.evaluate(() => {
    const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }; };
    return {
      docH: document.documentElement.scrollHeight, vh: innerHeight,
      tl: q('.tl'), timeslot: q('.time__slot'), stage: q('.app__stage'),
      dossier: q('.app__dossier'), prose: q('.dsr__prose'), dossierBody: q('.dossier__body'),
      dossierCls: (document.querySelector('.app__dossier > *') || {}).className || null,
      map: q('.map'),
    };
  });
  log(JSON.stringify(m, null, 1));
  await shot('top');
};
