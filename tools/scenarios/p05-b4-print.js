/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-print.js — how many A4 pages is the revision sheet, after a route? */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  // seed a full-ish ledger so the sheet is at its longest
  await page.evaluate((mode) => {
    window.__MODE = mode;
    const B = window.BEA;
    const beats = (window.__MODE === 'core')
      ? ['poster','spine','resistance','compensation','revenue-loop','egypt','scramble','two-track','two-in-tension','exits','fourteen']
      : ['poster','spine','resistance','compensation','revenue-loop','egypt','scramble','two-track','two-in-tension','exits','fourteen','barbados','who-took-bengal','nationalisation','princely','singapore'];
    for (const id of beats) B.bus.emit('ledger:append', { kind: 'completed', beatId: id, claimId: 'p05:' + id + ':completed' });
    for (let i = 0; i < (window.__MODE === 'core' ? 2 : 5); i++) B.bus.emit('ledger:append', { kind: 'predicted', claimId: 'p05:x' + i, beatId: 'poster', youSaid: String(i + 3), answer: '16', verdict: 'corrected', prompt: 'a guess' });
    B.bus.emit('ledger:append', { kind: 'retold', claimId: 'p05:through-line', youSaid: 'It began as sugar islands worked by enslaved people who kept rising, became a company that taxed Bengal and paid for its own conquests, and ended when the people it ruled organised and Britain ran out of money.' });
  }, process.env.MODE || 'full');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Print my revision sheet/.test(x.textContent || '')); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => {
    const p = document.querySelector('.tr-print');
    if (!p) return null;
    const r = p.getBoundingClientRect();
    const secs = [...p.querySelectorAll('section, h1, p.tr-print__by, p.tr-print__foot')].map(n => n.className + ' h=' + Math.round(n.getBoundingClientRect().height));
    const ppl = p.querySelectorAll('.tr-print__s--cols')[1];
    const dbg = ppl ? { cols: getComputedStyle(ppl).columnCount, w: Math.round(ppl.getBoundingClientRect().width), kid: ppl.querySelector('p') ? Math.round(ppl.querySelector('p').getBoundingClientRect().width) : null, n: ppl.querySelectorAll('p').length } : null;
    const texts = [...p.querySelectorAll('.tr-print__s--cols')].map(n => ({ h: Math.round(n.getBoundingClientRect().height), n: n.querySelectorAll('p').length, first: (n.querySelector('p') || {}).textContent }));
    return { h: Math.round(r.height), w: Math.round(r.width), secs, dbg, texts, chars: (p.textContent || '').length };
  });
  log('PRINT REGION ' + JSON.stringify(m, null, 1));
  // A4 content height at 96dpi with the sheet's own margins
  /* A4 is 297mm = 1122px at 96dpi; `@page { margin: 10mm 12mm }` leaves
     1122 - 2*38 = 1046px of content per page. */
  const PAGE = 1046;
  if (m) log('pages at A4 (1046px of content per page): ' + (m.h / PAGE).toFixed(2));
  await shot('print');
  await page.emulateMedia({ media: 'screen' });
};
