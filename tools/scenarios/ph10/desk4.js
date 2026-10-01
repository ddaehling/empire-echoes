module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1200);
  await page.locator('button:has-text("Classroom")').first().click();
  await page.waitForTimeout(1400);
  const m = await page.evaluate(() => {
    const R = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const out = { read: document.documentElement.getAttribute('data-read') };
    const scr = [...document.querySelectorAll('*')].filter(e => {
      const cs = getComputedStyle(e);
      return /auto|scroll/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 8 && e.clientHeight > 40;
    }).map(e => ({ cls: String(e.className || '').slice(0, 50), r: R(e), sh: e.scrollHeight, ch: e.clientHeight }));
    out.scrollers = scr;
    out.map = (document.querySelector('.stage__map') || {}).getBoundingClientRect ? R(document.querySelector('.stage__map')) : null;
    out.sheet = document.querySelector('.app__sheet') ? R(document.querySelector('.app__sheet')) : null;
    out.fitBtn = [...document.querySelectorAll('button')].filter(b => /^map/i.test((b.textContent || '').trim())).map(b => (b.textContent || '').trim());
    return out;
  });
  log(JSON.stringify(m, null, 1));
  /* try to find print */
  const pr = await page.evaluate(() => [...document.querySelectorAll('button,a')].map(e => (e.textContent || '').trim().replace(/\s+/g, ' ')).filter(t => /print|pack|plan|pdf|sheet/i.test(t)).slice(0, 30));
  log('PRINTY CONTROLS ' + JSON.stringify(pr));
  await shot('classroom');
};
