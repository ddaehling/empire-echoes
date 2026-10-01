module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2500);
  const snap = async (tag) => log(tag + ' ' + JSON.stringify(await page.evaluate(() => {
    const n = document.querySelector('.tr-bar__next');
    return { c: document.querySelector('.tr-bar__count')?.textContent, next: n ? (n.disabled?'disabled':'ENABLED') : 'absent',
      field: !!document.querySelector('.tr-field'), placed: document.querySelectorAll('.tr-field__cell[aria-checked="true"]').length,
      go: !!document.querySelector('.tr-go'), tgo: !!document.querySelector('.tr-tension__go') };
  })));
  await snap('step4 before passes:');
  for (let pass = 0; pass < 5; pass++) {
    await page.evaluate(() => {
      const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      const seen = new Set();
      for (const b of document.querySelectorAll('.tr-tension__opt, .tr-choice, .hg-arg__opt, .qz-opt')) {
        if (!vis(b) || b.disabled) continue; const g = b.parentElement; if (seen.has(g)) continue; seen.add(g); b.click();
      }
      for (const sel of ['.tr-tension__go', '.tr-source__go', '.tr-go', '.hg-arg__go', '.qz__commit']) {
        const b = document.querySelector(sel); if (b && vis(b) && !b.disabled) b.click();
      }
    });
    await page.waitForTimeout(300);
    await snap('  after pass ' + (pass+1) + ':');
  }
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click(); });
  await page.waitForTimeout(450);
  await snap('after Next +450ms:');
};
