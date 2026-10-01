/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'get').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Every change in every year in all four definitions, checked for the kinds of
   sentence a student would be marked wrong for. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  log(await page.evaluate(() => {
    const D = window.BEA.data, tl = document.querySelector('.tl').__p03;
    const defs = {
      claimed: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere',
      administered: (e) => e.controlDegree >= 3,
      controlled: (e) => e.controlDegree === 5,
      influenced: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere',
    };
    const problems = [];
    let total = 0, withHow = 0, withRecord = 0, subjectIsWholeTerritory = 0;
    for (const [id, test] of Object.entries(defs)) {
      const m = tl.model.forDefinition(id, test, id);
      for (const [y, rec] of m.years) for (const g of rec.groups) {
        total++;
        if (g.how) withHow++;
        if (g.recordId) withRecord++;
        if (g.wholeTerritory) subjectIsWholeTerritory++;
        if (!g.subject) problems.push(id + ' ' + y + ' EMPTY SUBJECT');
        if (g.dir === 'out' && /^taken by/.test(g.mechanism)) problems.push(id + ' ' + y + ' OUT SAYS TAKEN ' + g.subject);
        if (g.dir === 'in' && /^left by/.test(g.mechanism)) problems.push(id + ' ' + y + ' IN SAYS LEFT ' + g.subject);
        // the round-1 defect: the chip naming a whole territory that did not wholly move
        if (g.wholeTerritory) {
          const t = D.get(g.territoryId);
          if (t && t.units.length !== g.units.length) problems.push(id + ' ' + y + ' WHOLE-TERRITORY LABEL ON A FRAGMENT ' + g.subject);
        }
        if (/undefined|NaN|\[object/.test(g.subject + g.mechanism + g.howShort)) problems.push(id + ' ' + y + ' JUNK ' + g.subject + ' :: ' + g.mechanism + ' :: ' + g.howShort);
      }
    }
    // the exact 1858 sentence the critic caught
    const m = tl.model.forDefinition('claimed', defs.claimed, 'claimed');
    const y1858 = (m.years.get(1858) || { groups: [] }).groups.map(g => g.subject + ' :: ' + g.mechanism);
    return JSON.stringify({
      total, withHow, withRecord, subjectIsWholeTerritory,
      problems,
      andamanCheck: y1858.filter(t => /Andaman|British India/.test(t)),
    }, null, 1);
  }));
};
