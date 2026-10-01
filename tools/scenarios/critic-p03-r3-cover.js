/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'textContent').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const d = await page.evaluate(() => {
    const D = window.BEA.data;
    const SOFT = new Set(['circa','contested','range','decade','century']);
    const soft = o => !!o && (o.circa===true || SOFT.has(o.precision));
    let softN=0, softNoNote=0, contested=0, contestedNoNote=0;
    const scan = (arr, f) => { for (const r of arr) { const dt=f(r); if (soft(dt)) { softN++; if(!dt.note) softNoNote++; } if (r.contested && r.contested.isContested) { contested++; if(!r.contested.note) contestedNoNote++; } } };
    scan(D.events, r=>r.date); scan(D.acquisitions, r=>r.date); scan(D.departures, r=>r.date);
    return { events:D.events.length, acq:D.acquisitions.length, dep:D.departures.length, spans:D.spans.length, softN, softNoNote, contested, contestedNoNote };
  });
  log('data:', JSON.stringify(d));
  const marks = await page.evaluate(() => {
    // count uncertain years by reading marks and their aria labels
    const bs=[...document.querySelectorAll('.tl-mark')];
    let total=0; bs.forEach(b=>{ const n=b.querySelector('.tl-mark__n').textContent.trim(); total += n? +n : 1; });
    return { markEls: bs.length, yearsRepresented: total, labels: bs.slice(0,6).map(b=>b.getAttribute('aria-label')) };
  });
  log('marks:', JSON.stringify(marks));
};
