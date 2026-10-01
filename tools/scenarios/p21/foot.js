module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2000);
  log(JSON.stringify(await page.evaluate(() => {
    const dump = (e, d) => { if (!e || d > 3) return null; const r = e.getBoundingClientRect();
      return { c: e.tagName.toLowerCase()+'.'+String(e.className).trim().replace(/\s+/g,'.').slice(0,40),
               x:Math.round(r.x), y:Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
               t: (e.children.length?'':e.textContent.trim().slice(0,30)),
               kids: [...e.children].map(c => dump(c, d+1)).filter(Boolean) }; };
    const f = document.querySelector('.map__furniture');
    return { furniture: f ? dump(f, 0) : null };
  }), null, 1));
};
