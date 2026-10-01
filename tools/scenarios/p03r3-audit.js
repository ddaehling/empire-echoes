/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'length').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  const r = await page.evaluate(() => {
    const tl = document.querySelector('.tl').__p03;
    const d = window.BEA.data;
    const empty = [];
    for (let y = 1750; y <= 1997; y++) {
      const it = tl.itemsFor(y);
      if (!it.all.length) empty.push(y);
    }
    // coverage of events
    const evYears = tl.events.years.length;
    // change years
    const cy = tl.def.changeYears;
    return {
      emptyYears: empty, emptyCount: empty.length,
      eventsTotal: tl.events.total, eventYears: evYears,
      changeYears: cy.length,
      has1997: cy.includes(1997), has1947: cy.includes(1947),
      shiftFrom1856: tl.nextChange(1856, 1), dataNext1856: d.nextChangeYear(1856, 1),
      shiftFrom1996: tl.nextChange(1996, 1),
      shiftFrom1946: tl.nextChange(1946, 1),
      marks: tl.scrub.markCount, rawMarks: tl.uncertain.length,
      stops: [...tl.stops.keys()].sort((a,b)=>a-b),
    };
  });
  log(JSON.stringify(r, null, 1));

  // mark hit test
  const hits = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.tl-mark:not([hidden])')];
    let bad = 0, small = 0, gaps = [];
    let prev = null;
    for (const b of btns) {
      const r = b.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) small++;
      const el = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      if (!el || !b.contains(el) && el !== b) bad++;
      if (prev) gaps.push(+(r.left - prev).toFixed(1));
      prev = r.right;
    }
    gaps.sort((a,b)=>a-b);
    return { n: btns.length, failHitTest: bad, underMin: small, minGap: gaps[0], medianGap: gaps[Math.floor(gaps.length/2)] };
  });
  log('marks: ' + JSON.stringify(hits));
};
