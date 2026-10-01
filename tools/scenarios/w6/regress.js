/** w6/regress.js — the two new core beats and the Close, at whatever viewport
 *  the harness was given: overflow, clipping and console errors. */
module.exports = async ({ page, log, shot }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  const stops = [
    ['#tour=core&step=1', 'poster'],
    ['#tour=core&step=3', 'barbados + the crossing'],
    ['#tour=core&step=7', 'the revenue loop'],
    ['#tour=core&step=9', 'princely'],
    ['#tour=core&step=17', 'fourteen'],
  ];
  for (const [addr, name] of stops) {
    await page.goto('http://localhost:8777/app/' + addr, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    const m = await page.evaluate(() => ({
      title: (document.querySelector('.cx-sheet__title') || {}).textContent || '',
      count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      h: document.documentElement.scrollWidth - window.innerWidth,
      v: document.documentElement.scrollHeight - window.innerHeight,
      clipped: [...document.querySelectorAll('.tr-panel, .cl-close, .tr-panel__foot, .viz-flow, .tr-defrun')]
        .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1); })
        .map((n) => n.className).join(' / '),
      flow: !!document.querySelector('.viz-flow'),
    }));
    log(name.padEnd(24) + ' ' + m.count.padEnd(9) + ' hOver=' + m.h + ' vOver=' + m.v
      + (m.flow ? ' [flow mounted]' : '') + (m.clipped ? '  CLIPPED ' + m.clipped : '') + '  ' + m.title.slice(0, 34));
  }
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'w6' }));
  await page.waitForTimeout(1400);
  const c = await page.evaluate(() => ({
    stand: ((document.querySelector('.cl-close__stand') || {}).textContent || '').slice(0, 70),
    audit: window.BEA.closeVoiceAudit,
    h: document.documentElement.scrollWidth - window.innerWidth,
    v: document.documentElement.scrollHeight - window.innerHeight,
  }));
  log('the Close             hOver=' + c.h + ' vOver=' + c.v + '  audit=' + JSON.stringify(c.audit && c.audit.problems) + '  ' + c.stand);
  await shot('close');
  log('ERRORS: ' + (errs.join(' | ') || 'none'));
};
