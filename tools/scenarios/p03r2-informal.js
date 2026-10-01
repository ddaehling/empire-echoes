/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'territoryAt').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The two sentences the critic marked as disqualifying, hunted across the whole
   axis and all four definitions: no informal-empire place may ever be printed
   as becoming independent, and no acquisition may be labelled with a territory
   that did not change. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  log(await page.evaluate(async () => {
    const tl = document.querySelector('.tl').__p03;
    const defs = {
      claimed: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere',
      administered: (e) => e.controlDegree >= 3,
      controlled: (e) => e.controlDegree === 5,
      influenced: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere',
    };
    const bad = [], counts = {};
    /* the status AT THE YEAR of the change, not "was informal at some point" */
    const D = window.BEA.data;
    const isInformalAt = (tid, y) => {
      const a = D.territoryAt(tid, y), b = D.territoryAt(tid, y - 1);
      return (a && a.status === 'informal-sphere') || (b && b.status === 'informal-sphere');
    };
    for (const [id, test] of Object.entries(defs)) {
      const m = tl.model.forDefinition(id, test, id);
      let n = 0, u = 0;
      for (const [y, rec] of m.years) {
        for (const g of rec.groups) {
          n++;
          if (isInformalAt(g.territoryId, y) && /independen/i.test(g.mechanism)) bad.push(id + ' ' + y + ' CHIP ' + g.subject + ' :: ' + g.mechanism);
        }
        for (const r of (rec.unmoved || [])) {
          u++;
          if (isInformalAt(r.territoryId, y) && /independen/i.test(r.mechanism)) bad.push(id + ' ' + y + ' UNMOVED ' + r.name + ' :: ' + r.mechanism);
        }
      }
      counts[id] = { groups: n, unmovedRecords: u };
    }
    // 1948 Argentina / Uruguay specifically, under the widest reading
    const m = tl.model.forDefinition('influenced', defs.influenced, 'influenced');
    const y48 = m.years.get(1948) || { groups: [], unmoved: [] };
    const arg = [...y48.groups.map(g => 'CHIP ' + g.subject + ' :: ' + g.mechanism), ...y48.unmoved.map(r => 'UNMOVED ' + r.name + ' :: ' + r.mechanism)]
      .filter(t => /Argentin|Uruguay/i.test(t));
    return JSON.stringify({ counts, offendingSentences: bad, argentinaUruguay1948: arg }, null, 1);
  }));
};
