/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-kbd.js — the through-line and the Close, keyboard only. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  const focus = () => page.evaluate(() => {
    const a = document.activeElement;
    return a ? (a.tagName.toLowerCase() + '.' + String(a.className).split(/\s+/)[0] + ' "' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 54) + '"') : 'none';
  });
  const seen = [];
  for (let i = 0; i < 140; i++) { await page.keyboard.press('Tab'); seen.push(await focus()); }
  const blanks = seen.filter(s => /Blank \d/.test(s));
  log('first blank at tab #' + (seen.findIndex(x=>/Blank \d/.test(x))+1) + ' of ' + seen.length + '; first Finish at #' + (seen.findIndex(x=>/Finish/i.test(x))+1));
  log('tab stops: ' + seen.length + '; blanks reachable: ' + blanks.length);
  blanks.slice(0, 8).forEach(b => log('  ' + b));
  const finish = seen.find(s => /Finish/i.test(s));
  log('finish reachable: ' + (finish || 'NO'));

  /* press the first blank with the keyboard and see where it lands */
  const ok = await page.evaluate(() => {
    const b = document.querySelector('.cl-say__blank, .cl-blk__gap');
    if (!b || b.tagName !== 'BUTTON') return 'no blank control';
    b.focus(); return document.activeElement === b ? 'focused' : 'not focusable';
  });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  log('enter on blank 1 (' + ok + ') -> ' + await page.evaluate(() => (document.querySelector('.cx-sheet__title') || {}).textContent + ' @step ' + window.BEA.store.getState().tourStep));
  await shot('kbd');

  /* Esc Esc reaches the Close, and the sign field takes focus */
  await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  log('after Esc Esc: ' + JSON.stringify(await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__title') || {}).textContent,
    closeOpen: !!document.querySelector('.cl-lines'),
    sign: !!document.querySelector('.cl-sign__field'),
  }))));
  await shot('kbd-close');
};
