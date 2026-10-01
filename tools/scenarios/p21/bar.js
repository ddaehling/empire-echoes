module.exports = async ({ page, log }) => {
  for (const s of [1,4,5,8,9,14,23]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1600);
    const r = await page.evaluate(() => {
      const vis = (e) => { const cs = getComputedStyle(e); if (cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0) return false; const r=e.getBoundingClientRect(); return r.width>2&&r.height>2; };
      const ctl = [...document.querySelectorAll('.app__bar button, .app__bar a[href]')].filter(vis);
      return { bar: document.getElementById('app').dataset.bar, n: ctl.length,
               labels: ctl.map(c => (c.textContent||'').trim().replace(/\s+/g,' ').slice(0,18)) };
    });
    log('step ' + String(s).padStart(2) + '  data-bar=' + r.bar + '  controls=' + r.n + '  ' + JSON.stringify(r.labels));
  }
};
