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
    const st = d.statusAt(1913);
    const arr = st instanceof Map ? [...st.entries()] : Object.entries(st);
    let informalWithDegree = [], nullDegree = [], informal = [];
    for (const [id, e] of arr) {
      if (e.status === 'informal-sphere') { informal.push(id); if (e.controlDegree != null) informalWithDegree.push([id, e.controlDegree]); }
      if (e.controlDegree == null) nullDegree.push([id, e.status]);
    }
    return { total: arr.length, informal: informal.length, informalWithDegree, nullDegree,
      };
  });
  log(JSON.stringify(r, null, 1).slice(0, 3000));
};
