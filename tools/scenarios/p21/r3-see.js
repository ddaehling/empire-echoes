/* Drive the through-line at one viewport and look at every state of it. */
const box = (sel) => {
  const e = document.querySelector(sel); if (!e) return null;
  const b = e.getBoundingClientRect(); const c = getComputedStyle(e);
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), disp: c.display, hidden: e.hidden };
};

module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2000);

  const read = () => page.evaluate((b) => {
    const f = new Function('sel', 'return (' + b + ')(sel)');
    const app = document.getElementById('app');
    const live = app.dataset.foot === 'off' ? '.cl-blk__line' : '.cl-bar .cl-say';
    const n = document.querySelector(live);
    const cl = n ? (() => { const bb = n.getBoundingClientRect(); const gs = [...n.querySelectorAll('.cl-say__g')];
      return { total: gs.length, scrollW: n.scrollWidth, clientW: n.clientWidth, scrollLeft: Math.round(n.scrollLeft), more: n.dataset.more || '',
        vis: gs.filter((g) => { const r = g.getBoundingClientRect(); return r.left >= bb.left - 1 && r.right <= bb.right + 1; }).map((g) => g.dataset.n) }; })() : null;
    const drawn = (() => { const c = document.querySelector('.stage__map canvas, .stage__map svg'); if (!c) return null; const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); })();
    const sc = document.querySelector('.tr-panel__scroll');
    return { foot: app.dataset.foot, dock: app.dataset.dock, line: cl,
      bar: f('.cl-bar'), spine: f('.cl-blk'), full: f('.cl-blk__full'), whole: f('.cl-say__all'),
      stageMap: f('.stage__map'), drawnMap: drawn,
      panel: sc ? sc.clientHeight + '/' + sc.scrollHeight : null,
      docScroll: document.documentElement.scrollHeight - innerHeight };
  }, box.toString());

  log('COLLAPSED ' + JSON.stringify(await read()));
  await shot('a-collapsed');

  const t = page.locator('.cl-blk__toggle');
  if (await t.count()) {
    await t.click();
    await page.waitForTimeout(500);
    log('SPINE OPEN ' + JSON.stringify(await read()));
    await shot('b-spine-open');
    await t.click();
    await page.waitForTimeout(400);
  }
  const w = page.locator('.cl-bar__whole');
  if (await w.count() && await w.isVisible()) {
    await w.click();
    await page.waitForTimeout(450);
    log('WHOLE OPEN ' + JSON.stringify(await read()));
    await shot('c-whole-open');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1400);
    log('AFTER ESC ' + JSON.stringify(await read()));
  }
  /* Esc Esc reaches the Close from wherever we are. */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  const closed = await page.evaluate(() => {
    const n = document.querySelector('.cl-close');
    return { open: !!n, h: n ? Math.round(n.getBoundingClientRect().height) : 0,
      stand: (document.querySelector('.cl-close__stand') || {}).textContent ? document.querySelector('.cl-close__stand').textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : null };
  });
  log('ESC ESC -> CLOSE ' + JSON.stringify(closed));
  await shot('d-close');
  /* And the sheet it prints. */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.cl-actions .btn')].find((x) => /Print/.test(x.textContent || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(700);
  const pr = await page.evaluate(() => {
    const p = document.querySelector('.tr-print');
    return { hidden: p ? p.hidden : null, arm: document.documentElement.dataset.p05print,
      h1: p ? (p.querySelector('h1') || {}).textContent : null,
      sections: p ? [...p.querySelectorAll('h2')].map((h) => h.textContent) : [] };
  });
  log('PRINT ' + JSON.stringify(pr));
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  await shot('e-print');
  await page.emulateMedia({ media: 'screen' });
};
