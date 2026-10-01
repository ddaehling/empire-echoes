/* Walk a route end to end from the door, then open the Close. */
const ROUTE = process.env.ROUTE || 'core';

module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  // start the route
  await page.evaluate((r) => {
    window.BEA.bus ? window.BEA.bus.emit('tours:start', { step: 0 }) : null;
  }, ROUTE).catch(() => {});
  await page.evaluate((r) => { location.hash = '#tour=' + r + '&step=1'; }, ROUTE);
  await page.waitForTimeout(1500);

  const t0 = Date.now();
  let n = 0;
  const seen = [];
  for (let i = 0; i < 60; i++) {
    const info = await page.evaluate(() => {
      const st = (window.BEA && window.BEA.toursState) || {};
      const app = document.getElementById('app');
      return {
        step: (window.BEA && window.BEA.store && window.BEA.store.getState().tourStep),
        tour: (window.BEA && window.BEA.store && window.BEA.store.getState().activeTour),
        locked: !!st.locked, done: !!st.done, running: !!st.running,
        head: (document.querySelector('.app__sheet .cx-sheet__head') || {}).innerText || '',
        blanks: (document.querySelector('.cl-blk') || {}).innerText || '',
      };
    });
    seen.push(info.step + ':' + (info.locked ? 'LOCK ' : '') + (info.head || '').replace(/\n/g, ' / ').slice(0, 70));
    if (info.locked) {
      // try gate field, decline, dispute controls
      const did = await page.evaluate(() => {
        const out = [];
        const cell = document.querySelector('.tr-field__cell');
        if (cell) { cell.click(); return 'cell'; }
        const groups = new Set();
        const opts = [...document.querySelectorAll('.tr-choice')];
        let picked = 0;
        for (const o of opts) { const par = o.parentElement; if (groups.has(par)) continue; groups.add(par); o.click(); picked++; }
        if (picked) out.push('choices:' + picked);
        const tas = [...document.querySelectorAll('.app__sheet textarea, .app__sheet input[type=text]')];
        if (tas.length) {
          for (const t of tas) {
            t.focus();
            t.value = 'A letter from Lobengula to Queen Victoria, written to disown a document he had been told said something else.';
            t.dispatchEvent(new Event('input', { bubbles: true }));
            t.dispatchEvent(new Event('change', { bubbles: true }));
          }
          out.push('typed:' + tas.length);
        }
        const bad = /next|back|close|map|read|more of|full record|open that|skip|rather/i;
        const go = [...document.querySelectorAll('.app__sheet button')]
          .filter(x => !x.disabled && !bad.test((x.textContent||'')) && !/cx-sheet__fit|cx-sheet__close|tr-choice|tr-panel__(next|more|fit)/.test(x.className));
        if (go.length) { go[0].click(); out.push('btn:' + go[0].className.slice(0,40)); return out.join(' '); }
        const d = document.querySelector('.tr-gate__decline');
        if (d) { d.click(); out.push('decline'); return out.join(' '); }
        const sk = [...document.querySelectorAll('.app__sheet button')].find(x => !x.disabled && /skip|rather/i.test(x.textContent));
        if (sk) { sk.click(); out.push('skip'); return out.join(' '); }
        return out.join(' ') || 'none';
      });
      seen[seen.length - 1] += ' -> unlock:' + did;
      await page.waitForTimeout(500);
    }
    /* ANSWER EVERYTHING THIS BEAT ASKS, whether or not it locks Next: the
       through-line's blanks are earned by the beats' own retrievals, so a walk
       that only presses Next proves nothing about the ending. */
    const did = await page.evaluate(() => {
      const out = [];
      const nums = [...document.querySelectorAll('.app__sheet .tr-row input')];
      for (const n of nums) { n.focus(); n.value = '8'; n.dispatchEvent(new Event('input', { bubbles: true })); out.push('guess'); }
      const groups = new Set();
      for (const o of document.querySelectorAll('.app__sheet .tr-choice')) {
        const par = o.parentElement; if (groups.has(par)) continue; groups.add(par); o.click(); out.push('choice');
      }
      const tas = [...document.querySelectorAll('.app__sheet textarea')];
      for (const t of tas) { if (t.value) continue; t.focus(); t.value = 'A letter written to disown a document its signer had been told said something else.'; t.dispatchEvent(new Event('input', { bubbles: true })); out.push('wrote'); }
      /* The ordering strip only accepts the chronologically next card, so
         try each remaining one until the pool stops shrinking. */
      for (let pass = 0; pass < 8; pass++) {
        const pool = [...document.querySelectorAll('.tr-order__btn')];
        if (!pool.length) break;
        const before = pool.length;
        for (const b of pool) { b.click(); if (document.querySelectorAll('.tr-order__btn').length < before) { out.push('order'); break; } }
        if (document.querySelectorAll('.tr-order__btn').length === before) break;
      }
      const bad = /next|back|close|map|read|more of|full record|open that|skip|rather|the other route|take the/i;
      const go = [...document.querySelectorAll('.app__sheet button')]
        .filter(x => !x.disabled && !bad.test((x.textContent||''))
          && !/cx-sheet__fit|cx-sheet__close|tr-choice|tr-routes|tr-panel__(next|more|fit)|cl-blk|cl-sign/.test(x.className));
      for (const b of go.slice(0, 2)) { b.click(); out.push('go:' + (b.textContent||'').trim().slice(0, 22)); }
      return out.join(' ');
    });
    if (did) seen[seen.length - 1] += ' | did:' + did;
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ((window.BEA && window.BEA.toursState) || {}));
    if (after.done) { seen.push('DONE at step ' + info.step); break; }
    const clicked = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__next');
      if (b && !b.disabled) { b.click(); return true; }
      return false;
    });
    if (!clicked) { seen.push('NEXT BLOCKED at ' + info.step); break; }
    await page.waitForTimeout(420);
    n++;
  }
  log('walk:', JSON.stringify(seen, null, 1));
  log('wallclock_s', ((Date.now() - t0) / 1000).toFixed(1));

  // final state
  const fin = await page.evaluate(() => {
    const st = (window.BEA && window.BEA.toursState) || {};
    return { st, step: window.BEA.store.getState().tourStep, tour: window.BEA.store.getState().activeTour,
      beatsDone: (JSON.parse(localStorage.getItem("bea.ledger.v1")||"[]").filter(e=>e.kind==="completed").map(e=>e.beatId)) };
  }).catch(e => String(e));
  log('final', JSON.stringify(fin));
  await shot('end-of-route');
  const blanks = await page.evaluate(() => {
    const c = document.querySelector('.cl-blk__count');
    const f = document.querySelector('.cl-blk__finish');
    const fs = document.querySelector('.cl-foot__finish, .cl-status__finish, [class*=finish]');
    const anyLine = document.querySelector('.cl-say');
    return { filled: anyLine ? anyLine.dataset.filled : null, count: c ? c.textContent : null, finishLabel: f ? (f.getAttribute('aria-label')||'') : null,
      allFinish: [...document.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(t=>/finish/i.test(t)),
      sentence: (document.querySelector('.cl-blk__line')||{}).innerText };
  });
  log('blanks', JSON.stringify(blanks));

  // open the Close
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(1200);
  const closeTxt = await page.evaluate(() => {
    const s = document.querySelector('.app__sheet');
    return s ? s.innerText.slice(0, 4200) : '(no sheet)';
  });
  log('CLOSE TEXT:\n' + closeTxt);
  await shot('close');
  const audit = await page.evaluate(() => (window.BEA && window.BEA.throughLineAudit) || null);
  log('audit', JSON.stringify(audit));

  // sign the through-line and print
  const signed = await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    if (!f) return 'no field';
    f.value = 'It started as sugar worked by enslaved people, became a company that ruled Bengal, one colour hiding many kinds of rule, and ended because the people it ruled organised and Britain ran out of money.';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    const n = document.querySelector('.cl-sign__name');
    if (n) { n.value = 'A Student'; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const b = [...document.querySelectorAll('.cl-sign__row button')].find(x => (x.textContent||'').trim() === 'Sign it');
    if (!b) return 'no sign button';
    b.click();
    return 'signed';
  });
  log('sign:', signed);
  await page.waitForTimeout(700);
  const printed = await page.evaluate(() => {
    const b = document.querySelector('.cl-foot__print') || [...document.querySelectorAll('.app__sheet button')].find(x => /print my revision/i.test(x.textContent||''));
    if (b) b.click();
    return true;
  });
  await page.waitForTimeout(700);
  const sheet = await page.evaluate(() => {
    const p = document.querySelector('.tr-print') || document.getElementById('tr-print');
    const links = [...document.querySelectorAll('.tr-print__link')].map(x => x.textContent);
    return { has: !!p, h1: (document.querySelector('.tr-print__h')||{}).textContent, links,
      pct: (p ? p.innerText : '').match(/\d+\s+%/g) || [],
      atlas: ((p ? p.innerText : '').match(/The atlas: [^.]*\./g) || []),
      blk: (document.querySelector('.cl-blk__count')||{}).textContent,
      finish: [...document.querySelectorAll('button')].filter(x=>/finish and print/i.test(x.textContent||'')).length,
      voice: window.BEA.closeVoiceAudit };
  });
  log('sheet', JSON.stringify(sheet, null, 1));
};
