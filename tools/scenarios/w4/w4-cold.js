/** w4-cold — deep-link cold into the middle of the route and press Next until
 *  a checkpoint fires. Report what it claims about what the student has seen. */
module.exports = async ({ page, shot, log }) => {
  const step = process.env.W4_STEP || '12';
  await page.goto('http://localhost:8777/app/#tour=core&step=' + step, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} });
  await page.waitForTimeout(1400);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(2000);
  for (let i = 0; i < 6; i++) {
    const s = await page.evaluate(() => {
      const txt = (x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
      return { quiz: !!document.querySelector('.qz'), eyebrow: txt('.cx-sheet__eyebrow'), title: txt('.cx-sheet__title'),
               lede: txt('.qz-cp__lede'), gap: txt('.qz-cp__gap'), why: txt('.qz-cp__why'),
               cp: (window.BEA && BEA.quiz.checkpoints) ? BEA.quiz.checkpoints() : null };
    });
    if (s.quiz) {
      log('COLD step=' + step + ' i=' + i + '\n  eyebrow: ' + s.eyebrow + '\n  title: ' + s.title
        + '\n  lede: ' + s.lede + '\n  gap: ' + s.gap + '\n  why: ' + String(s.why).slice(0, 220)
        + '\n  seen: ' + JSON.stringify(s.cp && s.cp.seen) + '\n  items: ' + JSON.stringify(s.cp && s.cp.items));
      await shot('cold-cp');
      return;
    }
    const moved = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') { b.click(); return true; }
      return false;
    });
    if (!moved) { log('cannot advance at i=' + i); break; }
    await page.waitForTimeout(900);
  }
  log('no checkpoint fired; cp=' + JSON.stringify(await page.evaluate(() => BEA.quiz.checkpoints())));
};
