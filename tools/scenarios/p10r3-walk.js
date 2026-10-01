/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-walk — walk the route the way the acceptance walkers do, and report
 *  the step where it stops and what is holding it. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} window.__asked = []; BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id)); });
  for (let i = 0; i < 40; i++) {
    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const id = window.__asked[window.__asked.length - 1];
      const item = id ? BEA.quiz.items().find((x) => x.id === id) : null;
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
    /* A gate holds Next until the student commits, and round 3 added two more
       kinds: a two-in-tension gate wanting five choices and a press, and a
       source beat wanting four lines written before it will show the atlas's
       four. Answer whichever is up — this walk measures the RETRIEVAL a
       Next-only student receives, not the gates, and a walker that stops at
       step 4 measures nothing. */
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
          const set = Object.getOwnPropertyDescriptor(
            ta.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
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
      await page.waitForTimeout(360);
    }
    const st = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      const bar = document.querySelector('.tr-bar');
      return {
        can: !!(b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'),
        label: b ? b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : null,
        bar: bar ? bar.textContent.replace(/\s+/g, ' ').slice(0, 60) : null,
        title: (document.querySelector('.tr-panel__title, .cx-sheet__title') || {}).textContent,
        pending: [...document.querySelectorAll('.tr-panel button:disabled, .tr-panel [aria-disabled=true]')].map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)).slice(0, 6),
      };
    });
    if (!st.can) { log('STOPPED at ' + st.bar + '  |  next=' + JSON.stringify(st.label) + '  |  title=' + st.title + '  |  disabled: ' + JSON.stringify(st.pending)); break; }
    await page.evaluate(() => document.querySelector('.tr-bar__next').click());
    await page.waitForTimeout(400);
  }
  log('asked: ' + JSON.stringify(await page.evaluate(() => window.__asked)));
  await shot('stopped');
};
