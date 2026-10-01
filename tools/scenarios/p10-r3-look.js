/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-r3-look — the §4 card as a student on the route actually sees it.
 *
 * Walks the 24-step lesson pressing Next until the quiz takes the rail, then
 * photographs the card at whatever viewport the run was given, before the
 * commit and after it. What is being looked at: does the card say WHY this
 * belief was chosen for this student, does the correction fit the sheet, and
 * does the map go where the evidence is.
 *
 *   node tools/inspect.js tools/scenarios/p10-r3-look.js --out /tmp/p10look --w 390 --h 844 --mobile
 */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    try { BEA.quiz.forget(); } catch (_) {}
    window.__asked = [];
    BEA.bus.on('quiz:asked', (p) => window.__asked.push(p.id));
  });

  let shots = 0;
  for (let i = 0; i < 40 && shots < 4; i++) {
    const here = await page.evaluate(() => {
      const id = window.__asked[window.__asked.length - 1];
      const q = document.querySelector('.qz');
      if (!q || !id || q.dataset.shot === id) return null;
      q.dataset.shot = id;
      const why = document.querySelector('.qz__why-chosen, .cx-ask__why, .qz__reason');
      const sheetTxt = (document.querySelector('#sheet') || document.body).innerText.replace(/\s+/g, ' ').trim();
      return { id, why: why ? why.innerText.replace(/\s+/g, ' ').trim() : null, sheet: sheetTxt.slice(0, 420) };
    });
    if (here) {
      log('--- ' + here.id);
      log('    card: ' + here.sheet);
      await shot(here.id + '-asked');
      shots += 1;
      await page.evaluate(async () => {
        const id = window.__asked[window.__asked.length - 1];
        const item = BEA.quiz.items().find((x) => x.id === id);
        let said = null;
        if (item.kind === 'choose' || item.kind === 'who') said = (item.options.find((o) => o.id !== item.answer) || {}).id;
        else if (item.kind === 'order' || item.kind === 'match') said = item.answer.slice().reverse();
        else if (item.kind === 'estimate') said = item.min;
        else if (item.kind === 'year') said = 1888;
        if (said !== null) BEA.quiz.answer(said);
      });
      await page.waitForTimeout(520);
      const after = await page.evaluate(() => {
        const s = document.querySelector('#sheet');
        const st = BEA.store.getState();
        return {
          text: s ? s.innerText.replace(/\s+/g, ' ').trim().slice(0, 700) : '',
          map: st.year + '/' + (st.selectedTerritoryId || '—'),
          overflow: s ? (s.scrollHeight > s.clientHeight + 2) : null,
          box: s ? [Math.round(s.getBoundingClientRect().width), Math.round(s.getBoundingClientRect().height)] : null,
        };
      });
      log('    after: map ' + after.map + ' · sheet ' + JSON.stringify(after.box) + ' · scrolls: ' + after.overflow);
      log('    ' + after.text);
      await shot(here.id + '-corrected');
    }
    await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') return;
      const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])');
      if (cell) cell.click();
    });
    await page.waitForTimeout(160);
    const more = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return false;
      b.click(); return true;
    });
    if (!more) break;
    await page.waitForTimeout(360);
  }
  log('asked in order: ' + (await page.evaluate(() => window.__asked.join(', '))));
};
