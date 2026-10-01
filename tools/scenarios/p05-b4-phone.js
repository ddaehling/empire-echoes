/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b4-phone.js — round-2 phone/classroom measurements for P05 + P21.
 *   node tools/inspect.js tools/scenarios/p05-b4-phone.js --out /tmp/x --mobile
 */
const ADDRS = (process.env.ADDRS || '#tour=thirty&step=17,#tour=thirty&step=6,#tour=core&step=0').split(',');

const M = () => {
  const q = (s) => document.querySelector(s);
  const box = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const sc = (s) => { const e = q(s); return e ? { ch: e.clientHeight, sh: e.scrollHeight, screenfuls: +(e.scrollHeight / Math.max(1, e.clientHeight)).toFixed(1) } : null; };
  const scrollAnc = (s) => {
    const e = q(s); if (!e) return null; let n = e.parentElement, out = [];
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) out.push(n.className);
      n = n.parentElement;
    }
    return out;
  };
  return {
    read: document.getElementById('app').getAttribute('data-read'),
    fit: document.documentElement.getAttribute('data-tour-fit'),
    title: (q('.cx-sheet__title') || {}).textContent,
    map: box('.stage__map'), sheet: box('.app__sheet'), time: box('.app__time'),
    ribbon: box('.legend__pin') || box('.stage__key'),
    scroll: sc('.tr-panel__scroll'), scrollBox: box('.tr-panel__scroll'),
    body: sc('.cx-sheet__body'),
    foot: box('.tr-panel__foot'),
    panelKind: (q('.tr-panel') || {}).dataset ? q('.tr-panel').dataset.kind : null,
    fitBtn: (() => { const b = q('.tr-panel__fit'); return b ? { text: (b.textContent || '').trim(), name: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') } : null; })(),
    anc: scrollAnc('.tr-panel__scroll'),
    docScroll: document.documentElement.scrollHeight - window.innerHeight,
  };
};

module.exports = async ({ page, shot, log }) => {
  for (const a of ADDRS) {
    await page.goto('http://localhost:8777/app/' + a, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(M);
    log('--- ' + a + '  ' + JSON.stringify(m));
    await shot('at' + a.replace(/[^a-z0-9]/gi, '-'));
  }

  /* the Close, on the phone, after a finished core route */
  await page.goto('http://localhost:8777/app/#tour=core&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  const c = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const box = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const b = q('.cx-sheet__body');
    const ta = q('.cl-sign__ta') || q('.cl-sign textarea') || q('.app__sheet textarea');
    return {
      read: document.getElementById('app').getAttribute('data-read'),
      fit: document.documentElement.getAttribute('data-tour-fit'),
      body: b ? { ch: b.clientHeight, sh: b.scrollHeight, screenfuls: +(b.scrollHeight / Math.max(1, b.clientHeight)).toFixed(1) } : null,
      map: box('.stage__map'), time: box('.app__time'), sheet: box('.app__sheet'),
      foot: box('.tr-panel__foot'),
      clScroll: (() => { const e = q('.cl-close__scroll'); return e ? { ch: e.clientHeight, sh: e.scrollHeight, screenfuls: +(e.scrollHeight / Math.max(1, e.clientHeight)).toFixed(1) } : null; })(),
      clBox: box('.cl-close'),
      ta: ta ? { rows: ta.rows, ch: ta.clientHeight, sh: ta.scrollHeight, cls: ta.className } : null,
      count: (q('.cl-blk__count') || {}).textContent,
      overTime: (() => { const p = q('.cl-sign') || q('.cl-panel'); const t = q('.app__time'); if (!p || !t) return null; const a = p.getBoundingClientRect(), z = t.getBoundingClientRect(); const ov = Math.max(0, Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top)); return Math.round(ov); })(),
    };
  });
  log('--- CLOSE(phone) ' + JSON.stringify(c));
  await shot('close-phone');
};
