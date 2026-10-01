/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-drive.js — drive everything this pass touched, in one session. */
module.exports = async ({ page, log, shot }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  const over = async (tag) => {
    const r = await page.evaluate(() => ({
      hOver: document.documentElement.scrollWidth - window.innerWidth,
      vOver: document.documentElement.scrollHeight - window.innerHeight,
      clipped: [...document.querySelectorAll('.tr-panel, .cl-close, .tr-figs, .tr-foot, .tr-panel__foot')]
        .filter(n => { const r2 = n.getBoundingClientRect(); return r2.width > 0 && (r2.right > window.innerWidth + 1 || r2.left < -1); })
        .map(n => n.className),
    }));
    log(tag.padEnd(26) + ' hOver=' + r.hOver + ' vOver=' + r.vOver + (r.clipped.length ? ' CLIPPED ' + r.clipped.join(', ') : ''));
  };
  const go = async (addr) => {
    await page.goto('http://localhost:8777/app/' + addr, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1400);
  };
  await go('#tour=core&step=6'); await over('loop + Bengal figure');
  await page.evaluate(() => { const b = document.querySelector('.tr-figs__disgo'); if (b) b.click(); });
  await page.waitForTimeout(400); await over('dispute open');
  await go('#tour=core&step=11'); await over('Amritsar staged');
  await go('#tour=thirty&step=7'); await over('recall card + foot');
  await go('#tour=core&step=9'); await over('source beat');
  await go('#tour=core&step=1');
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1400); await over('the Close');
  await shot('close');
  // keyboard: tab from the top and find the foot controls
  const tabs = await page.evaluate(() => {
    const seen = [];
    return seen;
  });
  const kb = await (async () => {
    await page.evaluate(() => document.body.focus());
    const out = [];
    for (let i = 0; i < 26; i++) {
      await page.keyboard.press('Tab');
      const a = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e) return 'none';
        return (e.className || e.tagName) + ' :: ' + (e.getAttribute('aria-label') || (e.textContent || '').trim().slice(0, 24));
      });
      out.push(a);
      if (/cl-foot|tr-panel__more|cx-sheet__fit/.test(a)) break;
    }
    return out;
  })();
  log('KEYBOARD reached in ' + kb.length + ' tabs: ' + kb[kb.length - 1]);
  log('ERRORS: ' + (errs.length ? errs.join(' | ') : 'none'));
};
