module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.toursIndex, { timeout: 30000 });
  const edges = await page.evaluate(() => {
    const ix = window.BEA.toursIndex.routes.thirty.steps;
    return ix.filter(x => !x.optional && (x.kind === 'gate' || x.kind === 'dispute'))
      .map(x => ({ step: x.step, kind: x.kind, id: x.id, title: x.title }));
  });
  log('thirty forward edges: ' + JSON.stringify(edges));
  for (const e of edges) {
    await page.goto(base + '#tour=thirty&step=' + e.step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
    await page.waitForTimeout(1800);
    const s = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      const foot = [...document.querySelectorAll('.tr-panel__foot button, .cx-sheet__foot button')]
        .map(b => ({ t: (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), dis: b.disabled }));
      return { barNext: n ? { dis: n.disabled, tabindex: n.getAttribute('tabindex'), aria: n.getAttribute('aria-disabled') } : null,
        field: !!document.querySelector('.tr-field'),
        head: ((document.querySelector('.cx-sheet__head') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 60),
        foot };
    });
    log('step ' + e.step + ' (' + e.kind + ' ' + e.id + ') → ' + JSON.stringify(s));
    await shot('e' + e.step);
  }
};
