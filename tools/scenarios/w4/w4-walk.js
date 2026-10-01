/** w4-walk — walk a route end to end and report every retrieval moment:
 *  which step it fired on, what it asked, the band/reason printed, the
 *  interval line the card shows, and the running wall-clock. */
module.exports = async ({ page, shot, log }) => {
  const route = process.env.W4_ROUTE || 'core';
  await page.goto('http://localhost:8777/app/#tour=' + route + '&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    try { BEA.quiz.forget(); } catch (_) {}
    window.__asked = []; window.__beats = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push({ id: p.id, t: p.t, at: Date.now() }));
    BEA.bus.on('tours:beat', (p) => window.__beats.push({ id: p.id, n: p.n, recall: !!p.recall, at: Date.now() }));
  });

  const dwellAt = +(process.env.W4_DWELL_AT || -1);
  const dwellMs = +(process.env.W4_DWELL_MS || 0);

  const rows = [];
  for (let i = 0; i < 46; i++) {
    if (i === dwellAt && dwellMs) { log('dwelling ' + dwellMs + 'ms at i=' + i); await page.waitForTimeout(dwellMs); }
    /* Snapshot the step BEFORE answering anything. */
    const before = await page.evaluate(() => {
      const bar = document.querySelector('.tr-bar');
      const qz = document.querySelector('.qz');
      const txt = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      return {
        bar: bar ? bar.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : null,
        beat: window.__beats.length ? window.__beats[window.__beats.length - 1] : null,
        hasQuiz: !!qz,
        qEyebrow: txt('.qz .qz-eyebrow, .qz .cx-sheet__eyebrow, .cx-sheet__eyebrow'),
        qTitle: txt('.qz .qz-stem, .qz h3, .cx-sheet__title'),
        qStem: txt('.qz-stem'),
        qWhy: txt('.qz-why, .qz-cp__why, .qz-placed__why'),
        qLede: txt('.qz-cp__lede, .qz-rail-lede'),
        qAgo: txt('.qz-cp__gap'),
        say: txt('.cx-say, .ask-say, .cx-band__say'),
      };
    });
    if (before.hasQuiz) {
      rows.push({ i, step: before.beat, bar: before.bar, eyebrow: before.qEyebrow, stem: before.qStem || before.qTitle, why: before.qWhy, lede: before.qLede, ago: before.qAgo });
      await shot('q' + rows.length + '-' + (before.beat ? String(before.beat.id).replace(/[^\w]/g, '_') : 'x'));
    }

    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const a = window.__asked[window.__asked.length - 1];
      const item = a ? BEA.quiz.items().find((x) => x.id === a.id) : null;
      if (!item) return;
      let said = null;
      if (item.kind === 'choose' || item.kind === 'who') said = item.answer;
      else if (item.kind === 'order' || item.kind === 'match') said = item.answer.slice();
      else if (item.kind === 'estimate') said = item.answer;
      else if (item.kind === 'year') said = typeof item.answer === 'string' ? parseInt(item.answer, 10) : item.answer;
      else if (item.kind === 'explain') said = 'An answer.';
      if (said !== null) BEA.quiz.answer(said);
      await new Promise((r) => setTimeout(r, 300));
    });

    /* A checkpoint borrowed the rail from a beat: hand it back, the way a
       student presses the card's own primary control. */
    await page.evaluate(() => {
      for (const b of document.querySelectorAll('.qz__next .btn')) {
        if (/back to the lesson/i.test(b.textContent || '')) { b.click(); return; }
      }
    });
    await page.waitForTimeout(420);

    for (let g = 0; g < 4; g++) {
      const moved = await page.evaluate(() => {
        const b = document.querySelector('.tr-bar__next, .tr-panel__next');
        if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && /next/i.test(b.textContent || '')) return false;
        let did = false;
        for (const grp of document.querySelectorAll('.tr-tension__opts')) {
          const o = grp.querySelector('.tr-tension__opt:not([aria-pressed="true"])');
          if (o) { o.click(); did = true; }
        }
        for (const ta of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')) {
          if (ta.value && ta.value.trim().length > 8) continue;
          const set = Object.getOwnPropertyDescriptor(ta.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
          set.call(ta, 'A sentence, so the gate can be answered and the walk can go on.');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          did = true;
        }
        for (const go of document.querySelectorAll('.tr-tension__go, .tr-ask__go, .tr-src__go, .tr-panel .btn:not([disabled])')) {
          if (go.disabled || go.getAttribute('aria-disabled') === 'true') continue;
          if (!/show me|reveal|compare|beside/i.test(go.textContent || '')) continue;
          go.click(); did = true; break;
        }
        const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])');
        if (!did && cell) { cell.click(); did = true; }
        return did;
      });
      if (!moved) break;
      await page.waitForTimeout(340);
    }

    const st = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      const bar = document.querySelector('.tr-bar');
      return { can: !!(b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'),
               label: b ? b.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null,
               bar: bar ? bar.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null };
    });
    if (!st.can) { log('STOPPED i=' + i + ' bar=' + st.bar + ' next=' + JSON.stringify(st.label)); break; }
    await page.evaluate(() => document.querySelector('.tr-bar__next').click());
    await page.waitForTimeout(380);
  }

  log('ROUTE=' + route);
  log('BEATS: ' + JSON.stringify(await page.evaluate(() => window.__beats.map((b) => b.id + (b.recall ? '*' : '')))));
  log('ASKED: ' + JSON.stringify(await page.evaluate(() => window.__asked.map((a) => a.id + '/' + a.t))));
  log('CHECKPOINTS: ' + JSON.stringify(await page.evaluate(() => BEA.quiz.checkpoints())));
  for (const r of rows) log('RETRIEVAL @' + (r.step ? r.step.id + ' (n=' + r.step.n + ')' : '?') + '\n   eyebrow: ' + r.eyebrow + '\n   stem: ' + String(r.stem).slice(0, 150) + '\n   why: ' + String(r.why).slice(0, 220) + '\n   lede: ' + String(r.lede).slice(0, 200) + '\n   ago: ' + r.ago);
  await shot('end');
};
