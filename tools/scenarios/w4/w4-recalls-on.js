/** w4-recalls-on — WHAT HAPPENS WHEN THE PATH TURNS ITS OWN RECALLS ON.
 *  tours.json belongs to another agent, so this does not edit it: it patches
 *  the response in flight, so the floor can be measured against a `core` that
 *  places its own recall steps. Reports every retrieval, placed or fallback. */
module.exports = async ({ page, shot, log }) => {
  const list = (process.env.W4_RECALLS || 't3-middle-passage,t16-bengal-1943,t8-army,t14-peak').split(',');
  await page.route('**/tours.json*', async (route) => {
    const res = await route.fetch();
    const doc = JSON.parse(await res.text());
    doc.variantMeta.core.recalls = list;
    await route.fulfill({ response: res, body: JSON.stringify(doc), headers: { ...res.headers(), 'content-type': 'application/json' } });
  });
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    try { BEA.quiz.forget(); } catch (_) {}
    window.__asked = []; window.__beats = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id + '/' + p.t));
    BEA.bus.on('tours:beat', (p) => window.__beats.push(p.id + (p.recall ? '*' : '')));
  });
  log('core steps: ' + JSON.stringify(await page.evaluate(() => BEA.toursIndex.routes.core.steps.map((s) => s.kind[0] + ':' + s.id))));
  const rows = [];
  for (let i = 0; i < 46; i++) {
    const card = await page.evaluate(() => {
      const q = document.querySelector('.qz'); if (!q) return null;
      const txt = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      return { eyebrow: txt('.cx-sheet__eyebrow'), q: txt('.cx-ask__q'), gap: txt('.qz-cp__gap'),
               why: (txt('.qz-cp__why') || '').slice(0, 200), lede: txt('.qz-cp__lede') };
    });
    if (card) rows.push(card);
    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const id = (window.__asked[window.__asked.length - 1] || '').split('/')[0];
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
    await page.evaluate(() => { for (const b of document.querySelectorAll('.qz__next .btn')) if (/back to the lesson/i.test(b.textContent || '')) { b.click(); return; } });
    await page.waitForTimeout(420);
    for (let g = 0; g < 4; g++) {
      const moved = await page.evaluate(() => {
        const b = document.querySelector('.tr-bar__next, .tr-panel__next');
        if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' && /next/i.test(b.textContent || '')) return false;
        let did = false;
        for (const grp of document.querySelectorAll('.tr-tension__opts')) { const o = grp.querySelector('.tr-tension__opt:not([aria-pressed="true"])'); if (o) { o.click(); did = true; } }
        for (const ta of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')) {
          if (ta.value && ta.value.trim().length > 8) continue;
          const set = Object.getOwnPropertyDescriptor(ta.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
          set.call(ta, 'A sentence, so the gate can be answered and the walk can go on.');
          ta.dispatchEvent(new Event('input', { bubbles: true })); ta.dispatchEvent(new Event('change', { bubbles: true })); did = true;
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
    const st = await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); const bar = document.querySelector('.tr-bar');
      return { can: !!(b && !b.disabled && b.getAttribute('aria-disabled') !== 'true'), bar: bar ? bar.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : null }; });
    if (!st.can) { log('STOPPED i=' + i + ' ' + st.bar); break; }
    await page.evaluate(() => document.querySelector('.tr-bar__next').click());
    await page.waitForTimeout(380);
  }
  log('BEATS: ' + JSON.stringify(await page.evaluate(() => window.__beats)));
  log('ASKED: ' + JSON.stringify(await page.evaluate(() => window.__asked)));
  log('CP: ' + JSON.stringify(await page.evaluate(() => BEA.quiz.checkpoints())));
  rows.forEach((r, i) => log('CARD ' + (i + 1) + '  [' + r.eyebrow + ']  Q: ' + String(r.q).slice(0, 90) + '\n    gap: ' + r.gap + '\n    lede: ' + String(r.lede).slice(0, 120)));
  await shot('end');
};
