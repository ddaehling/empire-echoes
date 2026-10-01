/* pk/05-phone — is the Teaching desk readable at 390x844? Measure, then look. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  const vw = page.viewportSize();
  log('VIEWPORT ' + vw.width + 'x' + vw.height);
  await shot('cold');
  log('CONTROLS: ' + JSON.stringify(await page.evaluate(() =>
    [...document.querySelectorAll('button,[role=button],a')].map(b => (b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0, 60))));
  const opened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /teaching desk|§/i.test(x.innerText || x.getAttribute('aria-label') || ''));
    if (b) { b.click(); return b.innerText || b.getAttribute('aria-label'); }
    return null;
  });
  log('OPENED VIA: ' + opened);
  if (!opened) { await page.evaluate(() => { location.hash = '#panel=classroom'; }); await page.waitForTimeout(1400); }
  await page.waitForTimeout(1200);
  await shot('desk-open');
  const m = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null;
      const r = e.getBoundingClientRect(); const st = getComputedStyle(e);
      return { w: Math.round(r.width), h: Math.round(r.height), sh: e.scrollHeight, ch: e.clientHeight, ov: st.overflowY }; };
    return { sheet: g('.app__sheet'), body: g('.cx-sheet__body'), head: g('.cx-sheet__head'),
      tabs: g('.tp__tabs'), pages: g('.tp__pages'), win: { w: innerWidth, h: innerHeight },
      tabList: [...document.querySelectorAll('[role="tab"]')].map(t => ({ t: t.innerText, w: Math.round(t.getBoundingClientRect().width) })) };
  });
  log('MEASURE ' + JSON.stringify(m));
  const clicked = await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role="tab"]')].find(x => /classroom/i.test(x.innerText));
    if (t) { t.click(); return true; } return false;
  });
  log('CLASSROOM TAB: ' + clicked);
  await page.waitForTimeout(1300);
  await shot('classroom-phone');
  log('CLASSROOM ' + JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height) }; };
    return { readable: b ? { h: b.clientHeight, holds: b.scrollHeight, screens: +(b.scrollHeight / Math.max(1, b.clientHeight)).toFixed(1) } : null,
      unit: r('.tp-unit'), jump: r('.tp-jump'), overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
  })));
};
