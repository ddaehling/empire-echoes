/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** w7-walk.js — drive a whole route, recording per step: counter, title, the
 *  bar's Next word vs the panel foot's word, the on-path figure and its words,
 *  any checkpoint, any warrant marker, and the words on screen. */
const ROUTE = process.env.W7_ROUTE || 'core';

const ANSWER = () => {
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  for (const inp of document.querySelectorAll('.app__sheet input[type=number]')) {
    if (!vis(inp) || inp.value) continue;
    inp.value = String(inp.min && inp.max ? Math.round((+inp.min + +inp.max) / 2) : 3);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  for (const inp of document.querySelectorAll('.app__sheet input[type=range]')) {
    if (!vis(inp) || inp.dataset.w7) continue;
    inp.dataset.w7 = '1';
    inp.value = String(Math.round((+inp.min + +inp.max) / 2));
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    inp.dispatchEvent(new Event('change', { bubbles: true }));
  }
  for (const ta of document.querySelectorAll('.app__sheet textarea')) {
    if (!vis(ta) || ta.value) continue;
    ta.value = 'A committed answer, written so the beat has something of the student’s to record.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const seen = new Set();
  for (const b of document.querySelectorAll('.tr-tension__opt, .tr-choice, .hg-arg__opt, .qz-opt, .qz-choice__b')) {
    if (!vis(b) || b.disabled) continue;
    const g = b.parentElement; if (seen.has(g)) continue; seen.add(g); b.click();
  }
  for (let round = 0; round < 8; round++) {
    const pool = [...document.querySelectorAll('.tr-order__pool .tr-order__btn')].filter(vis);
    if (!pool.length) break;
    let landed = false;
    for (const b of pool) { b.click(); const pl = document.querySelector('.tr-order__pool'); if (!b.isConnected || !pl || !pl.contains(b)) { landed = true; break; } }
    if (!landed) break;
  }
  for (let k = 0; k < 6; k++) { const n = document.querySelector('.tr-loop__next'); if (n && vis(n) && !n.disabled) n.click(); }
  { const c = document.querySelector('.tr-loop__cut'); if (c && vis(c) && !c.disabled) c.click(); }
  for (const b of document.querySelectorAll('.tr-sort__b, .tr-years__b, .tr-defrun__b')) if (vis(b) && !b.disabled) b.click();
  const cell = document.querySelector('.tr-field__cell'); if (cell && vis(cell)) cell.click();
  for (const sel of ['.tr-tension__go', '.tr-source__go', '.tr-go', '.hg-arg__go', '.qz-go', '.viz-onpath__go', '.qz__commit']) {
    const b = document.querySelector(sel); if (b && vis(b) && !b.disabled) b.click();
  }
};

module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.goto('http://localhost:8777/app/#tour=' + (process.env.W7_ROUTE || 'core') + '&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);

  const rows = [];
  for (let i = 0; i < 40; i++) {
    // read BEFORE answering
    const pre = await page.evaluate(() => {
      const words = (s) => (String(s || '').trim().match(/\S+/g) || []).length;
      const n = document.querySelector('.tr-bar__next');
      const op = document.querySelector('.viz-onpath');
      const cp = document.querySelector('.qz-cp, .qz-check, [class*="qz-cp"]');
      const sheet = document.querySelector('.app__sheet');
      return {
        count: document.querySelector('.tr-bar__count')?.textContent || '',
        title: document.querySelector('.cx-sheet__title')?.textContent || '',
        barNext: n ? n.textContent.trim() : null,
        barLabel: n ? (n.getAttribute('aria-label') || '') : null,
        locked: !!(n && n.disabled),
        foot: [...document.querySelectorAll('.tr-panel__foot button')].map((b) => b.textContent.trim() + ' ||' + (b.getAttribute('aria-label') || '')),
        onpath: !!op,
        onpathWords: op ? words(op.innerText) : 0,
        cpWords: cp ? words(cp.innerText) : 0,
        cpClass: cp ? cp.className : null,
        sheetWords: sheet ? words(sheet.innerText) : 0,
        bad: [...document.querySelectorAll('.viz-fig--bad')].map((e) => e.textContent.trim().slice(0, 160)),
        cpLede: document.querySelector('.qz-cp__lede, .qz-lede')?.textContent || null,
      };
    });
    await page.evaluate(ANSWER); await page.waitForTimeout(350);
    await page.evaluate(ANSWER); await page.waitForTimeout(350);
    const post = await page.evaluate(() => {
      const words = (s) => (String(s || '').trim().match(/\S+/g) || []).length;
      const op = document.querySelector('.viz-onpath');
      const sheet = document.querySelector('.app__sheet');
      return {
        onpathWords: op ? words(op.innerText) : 0,
        sheetWords: sheet ? words(sheet.innerText) : 0,
        bad: [...document.querySelectorAll('.viz-fig--bad')].map((e) => e.textContent.trim().slice(0, 160)),
      };
    });
    rows.push({ i, ...pre, postOnpath: post.onpathWords, postSheet: post.sheetWords, postBad: post.bad });
    log('STEP ' + i + ' ' + JSON.stringify(rows[rows.length - 1]));
    const onCp = await page.evaluate(() => !!document.querySelector('.qz-cp__lede'));
    if (onCp) {
      const back = await page.evaluate(() => {
        const b = [...document.querySelectorAll('.cx-cta, button')].find((n) => /back to the beat/i.test(n.textContent || ''));
        if (!b) return false; b.click(); return true;
      });
      log('  CP at ' + rows[rows.length - 1].count + ' back=' + back);
      if (back) { await page.waitForTimeout(500); continue; }
    }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return false; n.click(); return true; });
    if (!moved) { log('STUCK at ' + i); break; }
    await page.waitForTimeout(450);
    const atClose = await page.evaluate(() => /What you can now defend/.test(document.querySelector('.cx-sheet__title')?.textContent || ''));
    if (atClose) { log('REACHED CLOSE after ' + (i + 1)); break; }
  }
  const tot = rows.reduce((a, r) => a + Math.max(r.sheetWords, r.postSheet), 0);
  log('TOTAL sheet words across steps: ' + tot);
  log('ONPATH words: ' + JSON.stringify(rows.filter((r) => r.onpath).map((r) => [r.count, r.onpathWords, r.postOnpath])));
  log('CHECKPOINTS: ' + JSON.stringify(rows.filter((r) => r.cpWords).map((r) => [r.count, r.cpClass, r.cpWords])));
  await shot('close');
  const close = await page.evaluate(() => ({
    stand: document.querySelector('.cl-close__stand')?.textContent || '',
    lines: [...document.querySelectorAll('.cl-line')].map((n) => n.querySelector('.cl-line__n')?.textContent + ':' + n.dataset.why + ':' + (n.querySelector('.cl-line__missing')?.textContent || '').slice(0, 110)),
  }));
  log('CLOSE ' + JSON.stringify(close, null, 1));
};
