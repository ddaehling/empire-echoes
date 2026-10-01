/** w4-shot — walk to the first two checkpoints and photograph the card, so the
 *  pre-test frame and the second-encounter frame can both be read. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { try { BEA.quiz.forget(); } catch (_) {} });
  let got = 0;
  for (let i = 0; i < 40 && got < 4; i++) {
    const q = await page.evaluate(() => !!document.querySelector('.qz'));
    if (q) {
      got++;
      const s = await page.evaluate(() => {
        const t = (x) => { const e = document.querySelector(x); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
        const sc = document.querySelector('.cx-sheet__body, .tr-panel__scroll');
        return { eyebrow: t('.cx-sheet__eyebrow'), lede: t('.qz-cp__lede'), gap: t('.qz-cp__gap'),
                 commit: (() => { const b = document.querySelector('.qz__commit'); if (!b) return null; const r = b.getBoundingClientRect();
                   const hit = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
                   return { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], visible: r.width > 0 && r.height > 0,
                            topmost: hit ? (hit.className || hit.tagName) : null, self: !!(hit && (hit === b || b.contains(hit))) }; })(),
                 scroll: sc ? [sc.scrollHeight, sc.clientHeight] : null };
      });
      log('CP' + got + ' ' + JSON.stringify(s));
      await shot('cp' + got);
    }
    await page.evaluate(async () => {
      if (!document.querySelector('.qz')) return;
      const c = document.querySelector('.qz__later'); if (c) c.click();
    });
    await page.waitForTimeout(400);
    for (let g = 0; g < 4; g++) {
      const moved = await page.evaluate(() => {
        const b = document.querySelector('.tr-bar__next');
        if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') return false;
        let did = false;
        for (const grp of document.querySelectorAll('.tr-tension__opts')) { const o = grp.querySelector('.tr-tension__opt:not([aria-pressed="true"])'); if (o) { o.click(); did = true; } }
        for (const ta of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')) {
          if (ta.value && ta.value.trim().length > 8) continue;
          const set = Object.getOwnPropertyDescriptor(ta.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
          set.call(ta, 'A sentence, so the gate can be answered and the walk can go on.');
          ta.dispatchEvent(new Event('input', { bubbles: true })); ta.dispatchEvent(new Event('change', { bubbles: true })); did = true;
        }
        for (const go of document.querySelectorAll('.tr-panel .btn:not([disabled])')) { if (!/show me|reveal|compare|beside/i.test(go.textContent || '')) continue; go.click(); did = true; break; }
        const cell = document.querySelector('.tr-field__cell:not([aria-pressed="true"])');
        if (!did && cell) { cell.click(); did = true; }
        return did;
      });
      if (!moved) break;
      await page.waitForTimeout(340);
    }
    const ok = await page.evaluate(() => { const b = document.querySelector('.tr-bar__next'); if (b && !b.disabled && b.getAttribute('aria-disabled') !== 'true') { b.click(); return true; } return false; });
    if (!ok) { log('stopped i=' + i); break; }
    await page.waitForTimeout(700);
  }
};
