module.exports = async ({ page, log, shot }) => {
  await page.addInitScript(() => { window.__printed = 0; const p = window.print; window.print = () => { window.__printed++; }; });
  const base = 'http://localhost:8777/app/';
  await page.goto(base + '#tour=period&step=10', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(2000);
  const fin = page.locator('.tr-panel__foot button:has-text("Finish"), button:has-text("Finish →")').first();
  await fin.click({ force: true }).catch(e => log('finish click ' + e.message));
  await page.waitForTimeout(2200);
  await shot('01-close');
  const m = await page.evaluate(() => {
    const sc = document.querySelector('.cx-sheet__body');
    const inner = document.querySelector('.tr-panel__scroll, .cl-scroll');
    const nest = [];
    const target = inner || sc;
    if (target) { let n = target.parentElement; while (n && n !== document.body) { const c = getComputedStyle(n);
      if (/(auto|scroll)/.test(c.overflowY) && n.scrollHeight > n.clientHeight + 2 && n.clientHeight > 8) nest.push(String(n.className) + ' ' + n.clientHeight + '/' + n.scrollHeight); n = n.parentElement; } }
    return { read: document.documentElement.getAttribute('data-read'),
      head: ((document.querySelector('.cx-sheet__head') || {}).innerText || '').replace(/\s+/g, ' '),
      win: target ? target.clientHeight + '/' + target.scrollHeight : null, nest,
      map: (() => { const e = document.querySelector('.stage__map'); if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height); })(),
      btns: [...document.querySelectorAll('button,a')].map(e => (e.textContent || '').trim().replace(/\s+/g, ' ')).filter(t => /print|sign|finish/i.test(t)).slice(0, 12) };
  });
  log('CLOSE ' + JSON.stringify(m));
  const p = page.locator('button:has-text("Print")').first();
  if (!(await p.count())) { log('NO PRINT'); return; }
  await p.click({ force: true }).catch(e => log('print click ' + e.message));
  await page.waitForTimeout(2500);
  log('window.print() calls: ' + await page.evaluate(() => window.__printed));
  const paper = await page.evaluate(() => {
    const el = document.querySelector('.cl-paper, .tp-paper, .rev-paper, [class*="paper"]');
    return el ? { cls: el.className, h: el.scrollHeight, text: el.innerText.slice(0, 4000) } : null;
  });
  log('PAPER ' + (paper ? paper.cls + ' h=' + paper.h + '\n' + paper.text : 'none found'));
  await shot('02-printed');
};
