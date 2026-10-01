/* hh/08-walk — walk the DEFAULT route end to end, keyboard only, and report every step. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: /^Start the lesson/i }).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);

  const snap = () => page.evaluate(() => {
    const counter = document.querySelector('.tr-bar__count, [class*="count"]');
    const head = document.querySelector('.tr-panel__lede, .cx-sheet__head, .tr-panel h2');
    const next = [...document.querySelectorAll('button')].find(b => /next beat/i.test(b.getAttribute('aria-label') || ''));
    const gate = [...document.querySelectorAll('button')].find(b => /place the fact/i.test(b.getAttribute('aria-label') || ''));
    const bar = document.querySelector('.tr-bar');
    return {
      bar: bar ? bar.innerText.replace(/\s+/g, ' ').slice(0, 90) : '-',
      head: head ? head.innerText.replace(/\s+/g, ' ').slice(0, 100) : '-',
      next: next ? (next.disabled ? 'DISABLED' : 'ok') : 'absent',
      gate: !!gate,
      panel: (document.querySelector('.tr-panel__scroll, .cx-sheet__body') || {}).innerText ?
        (document.querySelector('.tr-panel__scroll, .cx-sheet__body').innerText.replace(/\s+/g,' ').slice(0, 160)) : '-',
    };
  });

  for (let i = 1; i <= 16; i++) {
    const s = await snap();
    log('STEP ' + i + ' | bar="' + s.bar + '" | next=' + s.next + ' gate=' + s.gate);
    log('        head: ' + s.head);
    log('        body: ' + s.panel);
    await shot('w' + String(i).padStart(2, '0'));
    if (s.gate) {
      // keyboard: focus a field cell and press it
      const done = await page.evaluate(() => {
        const c = [...document.querySelectorAll('[role="radio"]')];
        if (!c.length) return 'no radios';
        c[4] ? c[4].focus() : c[0].focus();
        return 'focused ' + (c[4] || c[0]).getAttribute('aria-label');
      });
      log('        GATE: ' + done);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1200);
      const after = await snap();
      log('        GATE after: next=' + after.next);
    }
    const ok = await page.evaluate(() => {
      const n = [...document.querySelectorAll('button')].find(b => /next beat|finish|the ending/i.test(b.getAttribute('aria-label') || ''));
      if (!n || n.disabled) return false; n.focus(); return true;
    });
    if (!ok) { log('  -> no enabled Next; stop'); break; }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }
  await shot('final');
  log('FINAL: ' + JSON.stringify(await snap()));
};
