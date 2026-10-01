/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10-kbd — reach the question and answer it with the keyboard alone. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  await page.evaluate(() => BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(500);

  // reach the control by tabbing only
  let hops = 0, found = false;
  for (; hops < 60 && !found; hops++) {
    await page.keyboard.press('Tab');
    found = await page.evaluate(() => !!(document.activeElement && document.activeElement.classList.contains('qz-open')));
  }
  log('Recall control reached at tab stop ' + (found ? hops : 'NOT REACHED'));

  // R opens it from anywhere
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('r');
  await page.waitForTimeout(600);
  const opened = await page.evaluate(() => !!document.querySelector('#sheet .qz'));
  log('R opens the card: ' + opened);
  const kind = await page.evaluate(() => BEA.quiz.items().find(i => true) && document.querySelector('.cx-ask__q').textContent);
  log('question: ' + kind);
  await shot('01-opened-by-keyboard');

  // walk the card by keyboard and commit
  const steps = [];
  let moved = false, blockedState = null;
  for (let i = 0; i < 26; i++) {
    const at = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a) return 'none';
      return (a.tagName + '.' + String(a.className || '')).slice(0, 46);
    });
    steps.push(at);
    /* A reorder item is answered by reordering it. Nudge the first row we land
       on, the way a keyboard reader would, then carry on tabbing. */
    const isRow = await page.evaluate(() => !!(document.activeElement && document.activeElement.classList.contains('qz-order__i')));
    if (isRow && !moved) { moved = true; await page.keyboard.press('ArrowDown'); await page.waitForTimeout(120); }
    const isCommit = await page.evaluate(() => !!(document.activeElement && document.activeElement.classList.contains('qz__commit')));
    if (isCommit) {
      blockedState = await page.evaluate(() => document.activeElement.getAttribute('aria-disabled'));
      await page.keyboard.press('Enter'); break;
    }
    const isRadio = await page.evaluate(() => !!(document.activeElement && document.activeElement.type === 'radio'));
    if (isRadio) { await page.keyboard.press('Space'); await page.waitForTimeout(80); }
    const isRange = await page.evaluate(() => !!(document.activeElement && document.activeElement.type === 'range'));
    if (isRange) { for (let k = 0; k < 5; k++) await page.keyboard.press('ArrowRight'); }
    await page.keyboard.press('Tab');
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(500);
  log('focus walk: ' + steps.join(' > '));
  const answered = await page.evaluate(() => {
    const s = document.querySelector('.qz__ans');
    return { shown: !!(s && !s.hidden), text: s ? s.innerText.slice(0, 200).replace(/\n/g,' / ') : '' };
  });
  log('Commit reachable by Tab, aria-disabled at that moment: ' + blockedState);
  log('answered by keyboard alone: ' + answered.shown + '  — ' + answered.text);
  await shot('02-answered-by-keyboard');

  // a Commit that is still waiting is reachable AND says what is missing
  const blocked = await page.evaluate(() => new Promise(r => {
    BEA.quiz.close(); BEA.quiz.open('t6-who-conquered');
    setTimeout(() => {
      const c = document.querySelector('.qz__commit');
      c.focus();
      const reachable = document.activeElement === c;
      c.click();
      setTimeout(() => r({
        reachable,
        ariaDisabled: c.getAttribute('aria-disabled'),
        domDisabled: c.disabled,
        hint: (document.querySelector('.qz__hint') || {}).textContent || '',
        live: [...document.querySelectorAll('[aria-live]')].map(n => n.textContent).filter(Boolean).join(' | ').slice(-140),
        answered: !!(document.querySelector('.qz__ans') && !document.querySelector('.qz__ans').hidden),
      }), 250);
    }, 400);
  }));
  log('waiting Commit: ' + JSON.stringify(blocked));
  await page.evaluate(() => BEA.quiz.close());
  await page.waitForTimeout(200);
  await page.keyboard.press('r');
  await page.waitForTimeout(500);

  // Escape closes
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => !document.querySelector('#sheet .qz'));
  log('Escape closes the card: ' + closed);

  // focus ring visible on every control we own
  const rings = await page.evaluate(() => {
    BEA.quiz.open('t7-loop');
    return new Promise(r => setTimeout(() => {
      const els = [...document.querySelectorAll('.qz-order__i, .qz-order__u, .qz__commit, .qz-open')].filter(e => !e.disabled);
      const out = els.slice(0, 4).map(e => { e.focus(); const cs = getComputedStyle(e); return (e.className.split(' ')[0]) + ' outline=' + cs.outlineWidth + ' ' + cs.outlineStyle; });
      return r(out);
    }, 400));
  });
  log('focus rings: ' + rings.join(' | '));
};
