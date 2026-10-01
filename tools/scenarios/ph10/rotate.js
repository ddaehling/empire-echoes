module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(800);
  const snap = async (tag) => {
    const m = await page.evaluate(() => {
      const R = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const q = s => { const e = document.querySelector(s); return e ? R(e) : null; };
      const scr = [...document.querySelectorAll('*')].filter(e => {
        const cs = getComputedStyle(e);
        return /auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 8 && e.clientHeight > 30;
      }).map(e => ({ cls: String(e.className || '').slice(0, 40), r: R(e), sh: e.scrollHeight, ch: e.clientHeight }));
      /* clipped text */
      const clip = [];
      document.querySelectorAll('h1,h2,h3,p,li,button,span,td,th').forEach(e => {
        if (e.children.length) return;
        const t = (e.textContent || '').trim(); if (t.length < 8) return;
        if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) clip.push({ t: t.slice(0, 40), sw: e.scrollWidth, cw: e.clientWidth });
      });
      return { vw: innerWidth, vh: innerHeight, read: document.documentElement.getAttribute('data-read'),
        map: q('.stage__map'), sheet: q('.app__sheet'), time: q('.app__time'), lede: q('.app__lede'),
        docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight,
        scrollers: scr, clipped: clip.slice(0, 8), title: (document.querySelector('.cx-sheet__head') || {}).innerText };
    });
    log('--- ' + tag + ' --- ' + JSON.stringify(m));
    await shot(tag);
  };
  await page.evaluate(() => { location.hash = '#tour=period&step=6'; });
  await page.waitForTimeout(1600);
  await snap('01-portrait-step6');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(1800);
  await snap('02-landscape-step6');
  /* keep going in landscape */
  for (let i = 7; i <= 10; i++) {
    const n = page.locator('button:has-text("Next")').first();
    if (await n.count() && await n.isVisible()) { await n.click().catch(()=>{}); }
    await page.waitForTimeout(1100);
    await snap('0' + i + '-landscape-step' + i);
  }
  await page.setViewportSize({ width: 740, height: 360 });
  await page.waitForTimeout(1500);
  await snap('20-740x360');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await snap('21-back-portrait');
};
