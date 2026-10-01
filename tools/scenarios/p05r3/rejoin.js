module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1600);
  await page.evaluate(() => { location.hash = '#tour=core&step=1'; });
  await page.waitForTimeout(1500);
  // walk 4 steps
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const cell = document.querySelector('.tr-field__cell'); if (cell) cell.click();
      const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click();
    });
    await page.waitForTimeout(600);
  }
  const mid = await page.evaluate(() => ({ step: window.BEA.store.getState().tourStep, tour: window.BEA.store.getState().activeTour }));
  log('mid', JSON.stringify(mid));
  // leave the path — free explore
  await page.evaluate(() => { const e = document.querySelector('.tr-bar__escape, .ob-escape'); if (e) e.click(); else window.BEA.bus.emit('tours:stop', {}); });
  await page.waitForTimeout(700);
  await page.evaluate(() => { location.hash = '#year=1913&sel=barbados'; });
  await page.waitForTimeout(1500);
  const off = await page.evaluate(() => ({ step: window.BEA.store.getState().tourStep, tour: window.BEA.store.getState().activeTour, path: document.getElementById('app').dataset.path }));
  log('off-path', JSON.stringify(off));
  await shot('explore');
  // rejoin
  await page.evaluate(() => window.BEA.bus.emit('tours:start', {}));
  await page.waitForTimeout(1200);
  const back = await page.evaluate(() => ({ step: window.BEA.store.getState().tourStep, tour: window.BEA.store.getState().activeTour }));
  log('rejoined', JSON.stringify(back));
  // finish
  for (let i = 0; i < 20; i++) {
    const done = await page.evaluate(() => {
      const st = (window.BEA.toursState || {});
      if (st.done) return true;
      const cell = document.querySelector('.tr-field__cell'); if (cell) cell.click();
      const bad = /next|back|close|map|read|more of|full record|open that|skip|rather|other route|take the/i;
      const go = [...document.querySelectorAll('.app__sheet button')].filter(x => !x.disabled && !bad.test(x.textContent||'') && !/cx-sheet__fit|cx-sheet__close|tr-routes|tr-panel__(next|more|fit)|cl-/.test(x.className));
      for (const b of go.slice(0,2)) b.click();
      const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click();
      return false;
    });
    if (done) break;
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(1200);
  const d = await page.evaluate(() => ({
    stand: (document.querySelector('.cl-close__stand')||{}).innerText,
    late: (document.querySelector('.cl-close__late')||{}).innerText || null,
    voice: window.BEA.closeVoiceAudit,
    beats: JSON.parse(localStorage.getItem('bea.ledger.v1')||'[]').filter(e=>e.kind==='completed').length,
  }));
  log('close', JSON.stringify(d, null, 1));
  await shot('close');
};
