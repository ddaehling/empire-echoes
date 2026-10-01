/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-firstview — HOW MUCH OF THE QUESTION IS ACTUALLY IN VIEW.
 *
 * `index.js` already carries the measurement that produced this file's rule:
 * "the sheet band is 332px tall at 390×844 and a four-option card shows three
 * of them, so a reader who does not know a fourth exists never scrolls to it."
 * Under the dock law the sheet is 279px and its scrollport 223px, so the rule
 * bites harder, and the five §4 items added in this pass were written to the
 * wrong budget: `m15-borders` printed a five-line question and NOT ONE of its
 * five options above the fold.
 *
 * So this measures, per item, in the running app: the height of the question,
 * how many answer controls have any pixel inside the scrollport's first view,
 * and whether Commit is reachable without scrolling. A commit-then-correct
 * card whose commitment is below the fold is not a commit-then-correct card.
 *
 *   node tools/inspect.js tools/scenarios/p10-firstview.js --out /tmp/p10fv --mobile
 *   node tools/inspect.js tools/scenarios/p10-firstview.js --out /tmp/p10fv9 --w 900 --h 700
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  const ids = await page.evaluate(() => BEA.quiz.items().map((i) => i.id));
  const rows = [];
  for (const id of ids) {
    const r = await page.evaluate(async (qid) => {
      /* Cold every time. The one-line bargain ("nothing here is marked") is
         printed on the FIRST question a student is ever asked, and the first
         question is the one that most needs its answers visible — so the
         worst case is the case this file measures, not the average one. */
      BEA.quiz.close();
      try { BEA.quiz.forget(); } catch (_) {}
      BEA.quiz.open(qid);
      /* A `map` item flies the plate home on open; measure after it lands. */
      await new Promise((x) => setTimeout(x, 420));
      const qz = document.querySelector('.qz');
      const sc = qz && qz.closest('.cx-sheet__body');
      if (!qz || !sc) return null;
      const full = sc.getBoundingClientRect();
      let box = full;
      /* The Commit row is `position: sticky` when the card overflows, so it
         OVERLAYS the foot of the scrollport. The space a reader can actually
         read an answer in ends where that row begins, not where the sheet
         does — measuring against the sheet is how a card that shows one
         option reports two. */
      const pinned = qz.dataset.pin === 'yes' ? qz.querySelector('.qz__act:not([hidden])') : null;
      if (pinned) { const pb = pinned.getBoundingClientRect(); box = { top: box.top, bottom: Math.min(box.bottom, pb.top), height: box.height }; }
      /* WHOLLY inside the scrollport. A row whose last two lines are cut off
         is not an answer a reader can weigh, and counting a sliver as "in
         view" is how a card that shows one option reports three. */
      const inView = (n) => { const b = n.getBoundingClientRect(); return b.top >= box.top - 2 && b.bottom <= box.bottom + 2; };
      const partly = (n) => { const b = n.getBoundingClientRect(); return b.top < box.bottom - 2 && b.bottom > box.top + 2; };
      const q = qz.querySelector('.cx-ask__q');
      /* The CONTROLS a reader operates, one row each — not their wrappers.
         `.qz-est` is a 90px block around a 20px slider, and counting the
         block says "no answer visible" when the slider is right there. */
      /* On a `map` item at side-rail width the answer sheet is the map itself
         and the card offers a disclosure instead of a name list; that control
         is the answer surface there, so it counts. */
      const opts = [...qz.querySelectorAll('.qz-opt, .qz-order__i, .qz-range, .qz-year, .qz-ta, .qz-names .btn, .qz__in > .cx-more')]
        .filter((n) => n.offsetParent !== null || n === document.activeElement);
      const commit0 = qz.querySelector('.qz__commit');
      const commit = commit0 && !commit0.hidden ? commit0 : null;
      return {
        id: qid,
        kind: BEA.quiz.items().find((i) => i.id === qid).kind,
        words: q ? q.textContent.trim().split(/\s+/).length : 0,
        qh: q ? Math.round(q.getBoundingClientRect().height) : 0,
        port: Math.round(box.height),
        first: !!qz.querySelector('.qz__first'),
        opts: opts.length,
        optsInView: opts.filter(inView).length,
        optsPartly: opts.filter(partly).length,
        /* A map item has no Commit at all — the map is the control — so it is
           not "below the fold", it does not exist. */
        /* Against the WHOLE scrollport: the pinned row is the thing doing the
           overlaying, so it cannot be judged against its own shadow. */
        commitInView: !commit || (commit.getBoundingClientRect().bottom <= full.bottom + 2 && commit.getBoundingClientRect().top >= full.top - 2),
        scrolls: sc.scrollHeight - sc.clientHeight > 2,
      };
    }, id);
    if (r) rows.push(r);
  }
  await page.evaluate(() => BEA.quiz.close());
  /* THE RULE. Cold, at 390x844, every card must show its question, at least
     the first answer control, and the Commit row, without scrolling. Whole
     answers beyond the first are reported and wanted, but the sheet is 279px
     by the dock law's own arithmetic and the pinned control row overlays 48
     of it: on a three-line question there is room for one. What is NOT
     negotiable is that a reader can see there is something to answer. */
  const bad = rows.filter((r) => (r.opts > 0 && r.optsPartly === 0) || !r.commitInView);
  const thin = rows.filter((r) => r.opts > 0 && r.optsInView === 0);
  log(rows.map((r) =>
    ((r.opts > 0 && r.optsPartly === 0) || !r.commitInView ? 'FAIL  ' : (r.optsInView === 0 ? 'thin  ' : 'ok    '))
    + r.id.padEnd(22) + r.kind.padEnd(10)
    + 'q ' + String(r.words).padStart(3) + 'w/' + String(r.qh).padStart(3) + 'px'
    + '  port ' + r.port
    + (r.first ? '  cold' : '  warm')
    + '  answers whole in first view ' + r.optsInView + ' (+' + (r.optsPartly - r.optsInView) + ' cut) /' + r.opts
    + (r.commitInView ? '  commit visible' : '  COMMIT BELOW THE FOLD')).join('\n'));
  log('\n' + bad.length + ' cards hide every answer, or the Commit row, below the fold'
    + (bad.length ? ': ' + bad.map((b) => b.id).join(', ') : '')
    + '\n' + thin.length + ' show the first answer only partly'
    + (thin.length ? ': ' + thin.map((b) => b.id).join(', ') : ''));
  log(bad.length ? '>>> FIRST VIEW BROKEN' : '>>> every card puts an answer in the first view');
};
