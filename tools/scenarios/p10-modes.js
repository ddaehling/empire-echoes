/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10-modes — the card on a phone, in the dark, and with motion reduced. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(300);
  await page.evaluate(() => BEA.quiz.open('t17-amritsar'));
  await page.waitForTimeout(600);
  await shot('01-estimate');
  const geom = await page.evaluate(() => {
    const s = document.querySelector('#sheet');
    const m = document.querySelector('.stage__map canvas') || document.querySelector('.stage__map svg');
    const b = s ? s.getBoundingClientRect() : null;
    const mm = m ? m.getBoundingClientRect() : null;
    const timeR = document.querySelector('.app__time').getBoundingClientRect();
    return {
      sheet: b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null,
      map: mm ? { w: Math.round(mm.width), h: Math.round(mm.height) } : null,
      coversTimeBar: b ? (b.bottom > timeR.top + 2 && b.top < timeR.bottom - 2) : false,
      docScroll: document.documentElement.scrollHeight - innerHeight,
      innerScroll: (() => { const bd = document.querySelector('.cx-sheet__body'); return bd ? bd.scrollHeight > bd.clientHeight : null; })(),
    };
  });
  log('GEOM ' + JSON.stringify(geom));
  await page.evaluate(() => window.BEA.quiz.answer(1200));
  await page.waitForTimeout(600);
  await shot('02-answered');
  const txt = await page.evaluate(() => document.querySelector('#sheet').innerText.replace(/\n{2,}/g,'\n').slice(0, 900));
  log('CARD TEXT\n' + txt);
};
