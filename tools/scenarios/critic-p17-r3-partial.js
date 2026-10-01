/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const data = await mod.loadData();
    const st = data.statusAt(1900);
    let all=0, allPartial=0, claimedPartial=0, claimed=0, informalPartial=0;
    for (const e of st.values()) {
      all++;
      if (e.partial) allPartial++;
      const informal = e.status === 'informal-sphere';
      if (e.controlDegree >= 1 && !informal) { claimed++; if (e.partial) claimedPartial++; }
      if (informal && e.partial) informalPartial++;
    }
    return { all, allPartial, claimed, claimedPartial, informalPartial };
  });
  log(JSON.stringify(r));
};
