/** w4-viz — take the beat's own "Count it" jump on `barbados`, commit the
 *  middle-passage guess, and confirm the retrieval that later asks T3 calls it
 *  a second encounter rather than a first look. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} });
  const before = await page.evaluate(() => BEA.quiz.checkpoints().vizT);
  log('vizT before: ' + JSON.stringify(before));

  /* Walk to barbados. */
  for (let i = 0; i < 6; i++) {
    const at = await page.evaluate(() => (document.querySelector('.tr-bar') || {}).textContent || '');
    if (/barbados/i.test(at)) break;
    const ok = await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); if (b && !b.disabled) { b.click(); return true; } return false; });
    if (!ok) break;
    await page.waitForTimeout(700);
    const has = await page.evaluate(() => !!document.querySelector('.viz-onpath'));
    if (has) break;
  }
  await page.waitForTimeout(900);
  const fig = await page.evaluate(() => {
    const f = document.querySelector('.viz-onpath');
    return f ? { t: f.dataset.t, id: f.dataset.onpath } : null;
  });
  log('on-path figure: ' + JSON.stringify(fig));
  if (!fig) { log('no figure mounted; nothing to test'); return; }

  /* Commit its guess, the way a student who took the jump would. */
  await page.evaluate(() => {
    const f = document.querySelector('.viz-onpath');
    for (const r of f.querySelectorAll('input[type=range]')) {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      set.call(r, String(Math.round((+r.min + +r.max) / 2)));
      r.dispatchEvent(new Event('input', { bubbles: true }));
      r.dispatchEvent(new Event('change', { bubbles: true }));
    }
    for (const b of f.querySelectorAll('button')) {
      if (/commit/i.test(b.textContent || '') && !b.disabled) { b.click(); return; }
    }
  });
  await page.waitForTimeout(800);
  await shot('after-commit');
  log('vizT after: ' + JSON.stringify(await page.evaluate(() => BEA.quiz.checkpoints().vizT)));
  log('onScreenT:  ' + JSON.stringify(await page.evaluate(() => BEA.quiz.checkpoints().onScreenT)));

  /* Now the path's own recall for T3 fires two beats on. */
  for (let i = 0; i < 12; i++) {
    const q = await page.evaluate(() => {
      const t = (x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      return document.querySelector('.qz') ? { eyebrow: t('.cx-sheet__eyebrow'), gap: t('.qz-cp__gap'), rows: BEA.quiz.checkpoints().asked } : null;
    });
    if (q) { log('T3 CARD: ' + JSON.stringify(q)); return; }
    const ok = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') { b.click(); return true; }
      for (const ta of document.querySelectorAll('.tr-panel textarea')) {
        const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        set.call(ta, 'A sentence, so the gate can be answered.'); ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])'); if (cell) { cell.click(); return true; }
      return false;
    });
    if (!ok) break;
    await page.waitForTimeout(650);
  }
  log('no T3 card reached');
};
