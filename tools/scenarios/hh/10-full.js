/* hh/10-full — the whole default lesson, keyboard only, step by step, to the Close. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /^Start the lesson/i }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);

  const state = () => page.evaluate(() => {
    const bar = document.querySelector('.tr-bar');
    const panel = document.querySelector('.tr-panel__scroll, .cx-sheet__body, .tr-panel');
    return {
      bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : '-',
      head: (document.querySelector('.tr-panel__lede, .cx-sheet__head') || {}).innerText || '-',
      body: panel ? panel.innerText.replace(/\s+/g, ' ').trim() : '-',
      year: (document.querySelector('.tl__year, [class*="year"]') || {}).innerText || '',
    };
  });

  for (let i = 1; i <= 14; i++) {
    const s = await state();
    log('\n===== press ' + i + ' =====\nBAR: ' + s.bar + '\nHEAD: ' + s.head.replace(/\s+/g,' ') + '\nBODY: ' + s.body.slice(0, 700));
    await shot('s' + String(i).padStart(2,'0'));

    // gate?
    const isGate = /GATE/.test(s.bar);
    if (isGate) {
      await page.getByRole('button', { name: /place the fact/i }).first().focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(600);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
      log('GATE placed -> ' + (await state()).bar);
    }
    const moved = await page.evaluate(() => {
      const n = [...document.querySelectorAll('button')].find(b => /next beat/i.test(b.getAttribute('aria-label') || ''));
      if (n && !n.disabled) { n.focus(); return 'next'; }
      const f = [...document.querySelectorAll('.tr-bar button')].find(b => /finish/i.test((b.getAttribute('aria-label')||b.innerText||'')));
      if (f) { f.focus(); return 'finish:' + (f.innerText||'').trim(); }
      return null;
    });
    if (!moved) { log('STOP: nothing to press'); break; }
    log('pressing: ' + moved);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1600);
    if (moved.startsWith('finish')) { await page.waitForTimeout(1500); break; }
  }
  await shot('close');
  const close = await page.evaluate(() => (document.querySelector('.cl, .close, [class*="cl-"]') ? document.body.innerText : document.body.innerText));
  log('\n\n===== FINAL SCREEN =====\n' + close.slice(0, 6000));
};
