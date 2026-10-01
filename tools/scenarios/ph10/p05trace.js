/* p05-accept's walk, instrumented: which forward edges does it actually meet? */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1500);
  let gatesHit = 0;
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      return { locked: !!(n && n.disabled), tab: n ? n.getAttribute('tabindex') : null,
        count: document.querySelector('.tr-bar__count')?.textContent || '',
        title: (document.querySelector('.cx-sheet__title')?.textContent || '').slice(0, 42),
        gate: !!document.querySelector('.tr-field'), cp: !!document.querySelector('.qz-cp__lede') };
    });
    if (st.gate) gatesHit++;
    log('i=' + i + ' ' + st.count.replace(/\s+/g, ' ') + ' | ' + st.title + ' | field=' + st.gate + ' locked=' + st.locked + ' cp=' + st.cp + ' gatesHit=' + gatesHit);
    if (st.gate) {
      if (gatesHit === 3) await page.evaluate(() => document.querySelector('.tr-gate__decline')?.click());
      else await page.evaluate(() => document.querySelector('.tr-field__cell')?.click());
      await page.waitForTimeout(250);
    }
    for (let pass = 0; pass < 5; pass++) {
      await page.evaluate(() => {
        const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
        for (const inp of document.querySelectorAll('.app__sheet input[type=number]')) { if (!vis(inp) || inp.value) continue; inp.value = String(inp.min && inp.max ? Math.round((+inp.min + +inp.max) / 2) : 3); inp.dispatchEvent(new Event('input', { bubbles: true })); }
        for (const ta of document.querySelectorAll('.app__sheet textarea')) { if (!vis(ta) || ta.value) continue; ta.value = 'A committed answer.'; ta.dispatchEvent(new Event('input', { bubbles: true })); }
        const seen = new Set();
        for (const b of document.querySelectorAll('.tr-tension__opt, .tr-choice, .hg-arg__opt, .qz-opt')) { if (!vis(b) || b.disabled) continue; const g = b.parentElement; if (seen.has(g)) continue; seen.add(g); b.click(); }
        for (let round = 0; round < 8; round++) { const pool = [...document.querySelectorAll('.tr-order__pool .tr-order__btn')].filter(vis); if (!pool.length) break; let landed = false; for (const b of pool) { b.click(); if (!b.isConnected || !document.querySelector('.tr-order__pool')?.contains(b)) { landed = true; break; } } if (!landed) break; }
        for (let k = 0; k < 6; k++) { const n = document.querySelector('.tr-loop__next'); if (n && vis(n) && !n.disabled) n.click(); }
        { const c = document.querySelector('.tr-loop__cut'); if (c && vis(c) && !c.disabled) c.click(); }
        for (const b of document.querySelectorAll('.tr-sort__b, .tr-years__b, .tr-defrun__b')) if (vis(b) && !b.disabled) b.click();
        for (const sel of ['.tr-tension__go', '.tr-source__go', '.tr-go', '.hg-arg__go', '.qz__commit']) { const b = document.querySelector(sel); if (b && vis(b) && !b.disabled) b.click(); }
      });
      await page.waitForTimeout(300);
    }
    const onCp = await page.evaluate(() => !!document.querySelector('.qz-cp__lede'));
    if (onCp) { const back = await page.evaluate(() => { const b = [...document.querySelectorAll('.cx-cta, button')].find(n => /back to the beat/i.test(n.textContent || '')); if (!b) return false; b.click(); return true; }); if (back) { await page.waitForTimeout(500); continue; } }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return false; n.click(); return true; });
    if (!moved) { log('  cannot move at i=' + i); break; }
    await page.waitForTimeout(450);
  }
  log('TOTAL gatesHit=' + gatesHit);
};
