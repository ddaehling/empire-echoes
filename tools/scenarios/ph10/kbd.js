module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#tour=period&step=6'; });
  await page.waitForTimeout(1600);
  const seen = [];
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const e = document.activeElement; if (!e) return null;
      const b = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      const inside = b.x + b.width / 2 >= 0 && b.x + b.width / 2 <= innerWidth
        && b.y + b.height / 2 >= 0 && b.y + b.height / 2 <= innerHeight;
      const top = inside ? document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2) : null;
      let host = e, chain = [];
      while (host && chain.length < 8) { chain.push(host.tagName.toLowerCase() + (host.className && typeof host.className === 'string' ? '.' + host.className.trim().split(/\s+/)[0] : '')); host = host.parentElement; }
      return { tag: e.tagName, label: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 46),
        r: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
        vis: cs.visibility, inside, occluded: inside ? !(top === e || e.contains(top) || (top && top.contains(e))) : null,
        chain: chain.join(' < ') };
    });
    if (!f) break;
    seen.push(f);
  }
  for (const s of seen) log((s.occluded ? '!! ' : '   ') + JSON.stringify(s));
};
