/* The pure tap-through: press Next as fast as the app allows, click any gate
   cell at random, read nothing. Then open the Close and read what it claims. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 34; i++) {
    const cell = page.locator('.tr-field__cell').first();
    if (await cell.count()) { try { await cell.click({ timeout: 500 }); } catch (_) {} }
    const next = page.locator('.tr-bar__next');
    if (!(await next.count())) break;
    try { await next.click({ timeout: 800 }); } catch (_) { break; }
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(5200);   /* past the 4.2s freshness window */
  const strip = await page.evaluate(() => {
    const app = document.getElementById('app');
    const say = app.dataset.foot === 'off'
      ? document.querySelector('.cl-blk__line')
      : document.querySelector('.cl-bar .cl-say');
    if (!say) return { none: true, foot: app.dataset.foot };
    const box = say.getBoundingClientRect();
    const gs = [...say.querySelectorAll('.cl-say__g')];
    return { filled: say.dataset.filled, scrollW: say.scrollWidth, clientW: say.clientWidth, scrollLeft: Math.round(say.scrollLeft),
      more: say.dataset.more || '',
      visible: gs.filter((g) => { const r = g.getBoundingClientRect(); return r.left >= box.left - 1 && r.right <= box.right + 1; }).map((g) => g.dataset.n),
      leadVisible: (() => { const l = say.querySelector('.cl-say__lead'); if (!l) return null; const r = l.getBoundingClientRect(); return r.left >= box.left - 1; })(),
      firstWords: (() => { const el = document.elementFromPoint(box.left + 6, box.top + box.height / 2); return el ? (el.textContent || '').replace(/\s+/g,' ').trim().slice(0, 60) : null; })() };
  });
  log('STRIP AFTER TAP-THROUGH: ' + JSON.stringify(strip));
  await shot('after-taps');
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(900);
  const close = await page.evaluate(() => {
    const stand = document.querySelector('.cl-close__stand');
    const speed = document.querySelector('.cl-close__speed');
    const lines = [...document.querySelectorAll('.cl-line')].map((l) => l.dataset.can);
    const gates = [...document.querySelectorAll('.cl-block__row')].map((p) => (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 110));
    return { speed: speed ? (speed.textContent || '').replace(/\s+/g, ' ').trim() : 'NONE',
      stand: stand ? (stand.textContent || '').replace(/\s+/g, ' ').trim() : null,
      yes: lines.filter((x) => x === 'yes').length, no: lines.filter((x) => x === 'no').length, gates: gates.slice(0, 8) };
  });
  log('CLOSE: ' + JSON.stringify(close, null, 1));
  await shot('close-after-taps');
  const led = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]');
    const k = {}; for (const e of raw) k[e.kind] = (k[e.kind] || 0) + 1;
    return { kinds: k, total: raw.length, nonCompleted: raw.filter((e) => e.kind !== 'completed').map((e) => e.kind + ':' + e.claimId) };
  });
  log('LEDGER: ' + JSON.stringify(led));
};
