/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-r2-path — WHAT THE FLAGSHIP PATH ACTUALLY MAKES A STUDENT COMMIT ON.
 *
 * Round 2, the historian: "M15 ('borders drawn with a ruler explain what went
 * wrong afterwards') is onPath:false, along with M6 and M7. The rubric's C7
 * anchor 5 names that exact misconception as its example of a sympathetic
 * oversimplification. Put the four-borders item on the path."
 *
 * This walks the 24-step route from step 1 pressing Next and nothing else —
 * the student who does the minimum — and records every item the quiz actually
 * asked, which misconception each carried, and which of the eighteen the
 * student was therefore never made to commit on. It answers each asked item
 * WRONG, because a commitment that is never corrected is not a treatment.
 *
 *   node tools/inspect.js tools/scenarios/p10-r2-path.js --out /tmp/p10r2 --w 1366 --h 768
 */
module.exports = async ({ page, shot, log }) => {
  const tour = process.env.BEA_TOUR || 'thirty';
  await page.goto('http://localhost:8777/app/#tour=' + tour + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1400);

  await page.evaluate(() => {
    try { BEA.quiz.forget(); } catch (_) {}
    window.__asked = [];
    window.__placed = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id));
    BEA.bus.on('quiz:ask', (p) => window.__placed.push((p && p.id) || '(none)'));
  });

  const MAX = 40;
  let steps = 0;
  for (let i = 0; i < MAX; i++) {
    /* If a question is on the rail, answer it wrong, read the card, then go on. */
    const asked = await page.evaluate(async (RIGHT) => {
      const q = document.querySelector('.qz');
      if (!q) return null;
      const cur = BEA.quiz && BEA.quiz.items && window.__asked[window.__asked.length - 1];
      const item = cur ? BEA.quiz.items().find((x) => x.id === cur) : null;
      if (!item) return null;
      let said = null;
      if (item.kind === 'choose' || item.kind === 'who') said = RIGHT ? item.answer : (item.options.find((o) => o.id !== item.answer) || {}).id;
      else if (item.kind === 'order' || item.kind === 'match') said = RIGHT ? item.answer.slice() : item.answer.slice().reverse();
      else if (item.kind === 'estimate') said = RIGHT ? item.answer : item.min;
      else if (item.kind === 'year') said = RIGHT ? (typeof item.answer === 'string' ? parseInt(item.answer, 10) : item.answer) : 1888;
      else if (item.kind === 'explain') said = 'A deliberately empty answer.';
      if (said === null) return item.id;
      BEA.quiz.answer(said);
      await new Promise((r) => setTimeout(r, 380));
      /* Is a §4 belief offered under the correction, and what does it say? */
      const b = document.querySelector('.qz__next .qz-belief');
      return { id: item.id, belief: b ? b.innerText.replace(/\s+/g, ' ').trim() : null };
    }, process.env.BEA_RIGHT === '1');
    if (asked) log('  asked: ' + JSON.stringify(asked));

    /* A complication gate holds Next until a fact is placed. Place one. */
    await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      const locked = !b || b.disabled || b.getAttribute('aria-disabled') === 'true';
      if (!locked) return;
      const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])');
      if (cell) cell.click();
    });
    await page.waitForTimeout(220);

    const more = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
      b.click(); return true;
    });
    if (!more) break;
    steps += 1;
    await page.waitForTimeout(420);
  }

  const out = await page.evaluate(() => {
    const asked = window.__asked.slice();
    const items = BEA.quiz.items();
    const tags = (id) => {
      const it = items.find((x) => x.id === id);
      if (!it) return [];
      return [it.misconception, ...(it.alsoMisconceptions || [])].filter(Boolean);
    };
    const met = new Set();
    for (const id of asked) for (const m of tags(id)) met.add(m);
    const M18 = Array.from({ length: 18 }, (_, i) => 'M' + (i + 1));
    return {
      placed: window.__placed.slice(),
      asked,
      askedTags: asked.map((id) => id + ' [' + (tags(id).join('+') || 'no §4 tag') + ']'),
      metM: [...met].sort((a, b) => +a.slice(1) - +b.slice(1)),
      neverCommitted: M18.filter((m) => !met.has(m)),
      onPathFlags: items.filter((i) => i.onPath).map((i) => i.id),
      step: location.hash,
    };
  });

  log('');
  log('PATH: ' + tour + ', ' + steps + ' Next presses');
  log('placed by tours.json : ' + out.placed.join(', '));
  log('actually asked       :');
  for (const a of out.askedTags) log('   ' + a);
  log('§4 committed on      : ' + (out.metM.join(', ') || 'NONE'));
  log('§4 NEVER committed on: ' + out.neverCommitted.join(', '));
  await shot('end-of-path');
};
