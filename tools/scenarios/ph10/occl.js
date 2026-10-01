module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#tour=period&step=6'; });
  await page.waitForTimeout(1600);
  const info = await page.evaluate(() => {
    const path = (e) => { const p = []; let n = e; while (n && n.nodeType === 1 && p.length < 6) { p.push(n.tagName.toLowerCase() + (n.className && n.className.baseVal === undefined && n.className ? '.' + String(n.className).trim().replace(/\s+/g, '.') : '')); n = n.parentElement; } return p.join(' < '); };
    const out = [];
    document.querySelectorAll('button,a[href],[role="button"]').forEach(e => {
      const b = e.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      if (cx < 0 || cx > innerWidth || cy < 0 || cy > innerHeight) return;
      const top = document.elementFromPoint(cx, cy);
      if (top === e || e.contains(top) || (top && top.contains(e))) return;
      out.push({ label: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 50),
        me: path(e), blockedBy: top ? path(top) : null,
        r: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } });
    });
    return out;
  });
  log(JSON.stringify(info, null, 1));
  await shot('step6');
};
