/** w4-wrong — walk the route answering every question WRONG, which is what a
 *  real student does and what puts band 0 (things you got wrong) in charge of
 *  the checkpoint pick. Reports the four items and their T-numbers. */
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

  const rows = [];
  for (let i = 0; i < 46; i++) {
    const before = await page.evaluate(() => {
      const txt = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      return {
        beat: window.__beats.length ? window.__beats[window.__beats.length - 1] : null,
        hasQuiz: !!document.querySelector('.qz'),
        qEyebrow: txt('.cx-sheet__eyebrow'),
        qTitle: txt('.cx-sheet__title'),
        qStem: txt('.cx-ask__q'),
        qWhy: txt('.qz-cp__why'),
        qGap: txt('.qz-cp__gap'),
        qLede: txt('.qz-cp__lede'),
      };
    });
    if (before.hasQuiz) {
      rows.push({ i, step: before.beat, eyebrow: before.qEyebrow, title: before.qTitle, stem: before.qStem, why: before.qWhy, gap: before.qGap, lede: before.qLede });
    }

    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const a = window.__asked[window.__asked.length - 1];
      const item = a ? BEA.quiz.items().find((x) => x.id === a.id) : null;
      if (!item) return;
      let said = null;
      /* WRONG on purpose. */
      if (item.kind === 'choose' || item.kind === 'who') {
        const bad = (item.options || []).find((o) => o.id !== item.answer);
        said = bad ? bad.id : item.answer;
      } else if (item.kind === 'order' || item.kind === 'match') {
        said = item.answer.slice().reverse();
      } else if (item.kind === 'estimate') said = Math.round((item.answer || 1) * 4 + 7);
      else if (item.kind === 'year') { const y = typeof item.answer === 'string' ? parseInt(item.answer, 10) : item.answer; said = y + 43; }
      else if (item.kind === 'explain') said = 'An answer.';
      if (said !== null) BEA.quiz.answer(said);
      await new Promise((r) => setTimeout(r, 300));
    });

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
               bar: bar ? bar.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null };
    });
    if (!st.can) { log('STOPPED i=' + i + ' bar=' + st.bar); break; }
    await page.evaluate(() => document.querySelector('.tr-bar__next').click());
    await page.waitForTimeout(380);
  }

  log('ROUTE=' + route + ' (all answers deliberately wrong)');
  log('ASKED: ' + JSON.stringify(await page.evaluate(() => window.__asked.map((a) => a.id + '/' + a.t))));
  log('CHECKPOINTS: ' + JSON.stringify(await page.evaluate(() => { const c = BEA.quiz.checkpoints(); return { fired: c.fired, asked: c.asked, onScreenT: c.onScreenT, total: c.total }; })));
  for (const r of rows) log('RETRIEVAL @' + (r.step ? r.step.id + ' (n=' + r.step.n + ')' : '?')
    + '\n   eyebrow: ' + r.eyebrow + '\n   title: ' + r.title + '\n   stem: ' + String(r.stem).slice(0, 120)
    + '\n   lede: ' + String(r.lede).slice(0, 170) + '\n   gap: ' + r.gap + '\n   why: ' + String(r.why).slice(0, 200));
};
