/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [7, 11, 16, 22]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const r = await page.evaluate(async () => {
      const q = (await import('/app/js/quiz/index.js')).default;
      const item = q.items ? q.items.find((x) => x.id === 't3-middle-passage') : null;
      return {
        title: (document.querySelector('.cx-sheet__title') || {}).textContent || null,
        shape: Object.keys(window.BEA.quiz || {}).slice(0, 12),
        n: q.items ? q.items.length : null,
        dropped: q.dropped || null,
        hasT3: !!item,
        seen: (q.seen || []).length,
        pathPlaces: !!q.pathPlacesRetrieval,
        answered: q.sched && q.sched.answeredThisSession ? q.sched.answeredThisSession.size : null,
      };
    });
    log('step ' + s + ' :: ' + JSON.stringify(r));
  }
};
