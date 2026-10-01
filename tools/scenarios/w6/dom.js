module.exports = async ({ page, log }) => {
  const addr = process.env.ADDR || '#tour=core&step=11';
  await page.goto('http://localhost:8777/app/' + addr, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const out = await page.evaluate(() => {
    const body = document.querySelector('.cx-sheet__body') || document.body;
    const els = [...body.querySelectorAll('button, [role="button"], [role="radio"], input, textarea, select, [tabindex]')];
    return els.map((n) => {
      const r = n.getBoundingClientRect();
      return (r.width > 2 ? 'VIS ' : 'hid ') + n.tagName + '.' + String(n.className).slice(0, 46)
        + (n.disabled ? ' [disabled]' : '') + ' :: ' + ((n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 60));
    });
  });
  log(out.join('\n'));
};
