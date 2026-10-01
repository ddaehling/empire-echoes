/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-beliefs — WHERE A STUDENT ACTUALLY MEETS DIDACTIC_SPEC §4.
 *
 * Tagging a misconception is not treating one, and having a treatment in the
 * bank is not the same as a student reaching it. This drives the three routes
 * this module owns and asserts, at each of them, that the offer names the
 * BELIEF (not a topic), that pressing it opens a commit-then-correct card, and
 * that the card says why it was chosen for this reader.
 *
 * It talks to the tours piece only through the bus contract — `tours:beat`
 * and `quiz:ask` — never through its DOM, so it keeps working while P05 is
 * rebuilding its own transport.
 *
 *   node tools/inspect.js tools/scenarios/p10-beliefs.js --out /tmp/p10b --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p10-beliefs.js --out /tmp/p10b390 --mobile
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS  ' : 'FAIL  ') + id + '  — ' + got);

  await page.waitForFunction(() => window.BEA && window.BEA.quiz && window.BEA.quiz.unmetBeliefs, null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { try { BEA.quiz.forget(); localStorage.clear(); } catch (_) {} });

  /* 1 — a cold student has argued with none of the eighteen. */
  const cold = await page.evaluate(() => BEA.quiz.unmetBeliefs());
  t('1 cold: nothing argued with yet', cold.length === 18, cold.length + ' of 18 open');

  /* 2 — a retrieval THE PATH PLACED. This is the contract in FEATURE_SPEC §2
         P10: P05 owns where, this module owns which. Answer it, and the foot
         of the correction must offer a belief. */
  const placed = await page.evaluate(async () => {
    BEA.bus.emit('tours:start', { step: 0 });
    await new Promise((r) => setTimeout(r, 400));
    for (const b of [
      { id: 'poster', chapter: 'poster', t: 'T1' },
      { id: 'barbados', chapter: 'atlantic', t: 'T2' },
      { id: 'compensation', chapter: 'atlantic', t: 'T5' },
    ]) { BEA.bus.emit('tours:beat', b); await new Promise((r) => setTimeout(r, 90)); }
    BEA.bus.emit('quiz:ask', { id: 't3-middle-passage', beatId: 'compensation' });
    await new Promise((r) => setTimeout(r, 400));
    const q = (document.querySelector('.qz .cx-ask__q') || {}).textContent || '';
    BEA.quiz.answer(0);
    await new Promise((r) => setTimeout(r, 500));
    const off = document.querySelector('.qz__next .qz-belief');
    return {
      asked: q.slice(0, 50),
      offered: !!off,
      lead: off ? (off.querySelector('.qz-belief__a') || {}).textContent : '',
      belief: off ? (off.querySelector('.qz-belief__q') || {}).textContent : '',
      lines: off ? Math.round(off.getBoundingClientRect().height) : 0,
    };
  });
  t('2a the path placed a retrieval and it ran', placed.asked.length > 5, '“' + placed.asked + '…”');
  t('2b its correction offers a belief to argue with', placed.offered && placed.belief.length > 12,
    placed.lead + ' ' + placed.belief + '  (' + placed.lines + 'px)');
  await shot('placed-offer');

  /* 3 — press it. A commit-then-correct card, with the belief above the
         question and the reason for this student underneath it. */
  const opened = await page.evaluate(async () => {
    document.querySelector('.qz__next .qz-belief').click();
    await new Promise((r) => setTimeout(r, 420));
    const txt = (s) => { const n = document.querySelector(s); return n ? n.innerText.replace(/\s+/g, ' ').trim() : ''; };
    const item = BEA.quiz.items().find((i) => i.question === (document.querySelector('.qz .cx-ask__q') || {}).textContent);
    return {
      question: txt('.qz .cx-ask__q'),
      why: txt('.qz-cp__why'),
      m: item ? item.misconception : null,
      answers: document.querySelectorAll('.qz-opt, .qz-order__i, .qz-range, .qz-year').length,
    };
  });
  t('3a it opens a commit-then-correct card', opened.answers > 0 && opened.question.length > 5,
    opened.m + ' · ' + opened.answers + ' controls · “' + opened.question.slice(0, 60) + '”');
  t('3b the card says why this one, for this reader', /would say/.test(opened.why), opened.why.slice(0, 130));
  await page.evaluate(() => { window.__justArgued = (document.querySelector('.qz-cp__why') || {}).textContent || ''; });
  await shot('belief-card');

  /* 4 — answering it marks that belief argued with, and the NEXT offer is a
         different one. Nobody is asked to recant the same belief twice. */
  const after = await page.evaluate(async () => {
    const before = BEA.quiz.unmetBeliefs();
    const item = BEA.quiz.items().find((i) => i.question === (document.querySelector('.qz .cx-ask__q') || {}).textContent);
    const wrong = item.kind === 'choose' || item.kind === 'who'
      ? (item.options.find((o) => o.id !== item.answer) || {}).id
      : (item.kind === 'order' || item.kind === 'match') ? item.answer.slice().reverse()
        : item.kind === 'estimate' ? item.min : 1888;
    BEA.quiz.answer(wrong);
    await new Promise((r) => setTimeout(r, 450));
    const off = document.querySelector('.qz__next .qz-belief');
    return {
      m: item.misconception,
      before: before.length,
      now: BEA.quiz.unmetBeliefs().length,
      nextBelief: off ? (off.querySelector('.qz-belief__q') || {}).textContent : '',
      justArgued: window.__justArgued || '',
      nextLabel: (document.querySelector('.qz__next .qz__commit') || {}).textContent || '',
    };
  });
  t('4a committing on a belief records it', after.now < after.before,
    after.before + ' open before, ' + after.now + ' after (just argued: ' + after.m + ')');
  /* The offer stands DOWN when this student has something they got wrong and
     have not put right: putting that right outranks arguing with a new belief,
     and it is the band-0 rule the whole schedule is built on. Either outcome
     is correct; what would be wrong is offering the same belief twice. */
  t('4b the next offer is never the belief just argued with',
    !after.nextBelief || after.justArgued.indexOf(after.nextBelief.replace(/[“”]/g, '')) === -1,
    after.nextBelief ? 'next belief offered: ' + after.nextBelief.slice(0, 70)
      : 'stood down for “' + after.nextLabel.slice(0, 60) + '”, which this reader got wrong earlier');

  /* 5 — the fallback checkpoint, for a path that places none of its own: the
         eight-minute variant, an older tours.json, a deep link. */
  await page.evaluate(() => { BEA.quiz.close(); BEA.quiz.forget(); try { localStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  const fb = await page.evaluate(async () => {
    BEA.quiz.forget();
    BEA.bus.emit('tours:start', { step: 0 });
    await new Promise((r) => setTimeout(r, 400));
    for (const b of [
      { id: 'poster', chapter: 'poster', t: 'T1' },
      { id: 'barbados', chapter: 'atlantic', t: 'T2' },
      { id: 'revenue-loop', chapter: 'company', t: 'T7' },
      { id: 'egypt', chapter: 'imperial', t: 'T12' },
    ]) { BEA.bus.emit('tours:beat', b); await new Promise((r) => setTimeout(r, 140)); }
    await new Promise((r) => setTimeout(r, 700));
    const txt = (s) => { const n = document.querySelector(s); return n ? n.innerText.replace(/\s+/g, ' ').trim() : ''; };
    return { lede: txt('.qz-cp__lede'), why: txt('.qz-cp__why'), q: txt('.qz .cx-ask__q') };
  });
  t('5 a fallback checkpoint fires and names the belief it goes at',
    fb.q.length > 5 && /would say/.test(fb.why),
    (fb.q.slice(0, 45) || 'no card') + ' · ' + fb.why.slice(0, 110));
  await shot('checkpoint');

  /* 6 — off the path entirely: the lede band offers one when nothing is due.
         On a fresh page, because the offer is on a ninety-second cooldown and
         the checkpoint above has just spent it — which is the design. */
  await page.evaluate(() => { try { BEA.quiz.forget(); localStorage.clear(); } catch (_) {} history.replaceState(null, '', location.pathname); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  const say = await page.evaluate(async () => {
    let got = null;
    BEA.bus.on('ask:say', (p) => { if (p && p.id === 'quiz:due' && p.text) got = p; });
    BEA.quiz.forget();
    /* The offer never fires at `stage="plate"` — a reader who has not yet
       touched anything is being shown the map, not interrupted. Select a
       place, which is what a wandering student does. */
    BEA.store.dispatch('select', 'jamaica');
    await new Promise((r) => setTimeout(r, 500));
    BEA.store.dispatch('setYear', 1913);
    await new Promise((r) => setTimeout(r, 500));
    return got ? { mark: got.mark, text: got.text.replace(/<[^>]*>/g, '').slice(0, 150), cta: got.cta && got.cta.emit } : null;
  });
  /* The sentence is a LADDER now, not a string: the band is measured and given
     the longest rung it can hold, so "would say" is only the widest one. What
     has to be true at every width is that the belief is quoted, that it is
     framed as a question rather than asserted, and that the control opens the
     card that argues with it. */
  t('6 off the path, the band offers a belief when nothing is due',
    !!(say && /people (your age would )?say|do you think|true or not/i.test(say.text)
      && /[\u201c"]/.test(say.text) && say.cta === 'quiz:openBelief'),
    say ? say.mark + ': ' + say.text : 'no offer made (a beat or a due item may hold the band)');

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> §4 IS NOT REACHABLE ON EVERY ROUTE' : '>>> every route offers a belief, names it, and records the commitment');
};
