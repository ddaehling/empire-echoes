module.exports = async ({ page, log }) => {
  await page.goto(page.url().split('#')[0] + '#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2200);
  log(JSON.stringify(await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('.stage__key, .legend__pin, [data-mount="legend"]')) {
      const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
      out.push({ cls: e.className, mount: e.getAttribute('data-mount'), pos: c.position, disp: c.display,
        vis: c.visibility, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        hasZooms: !!e.querySelector(':scope > .map__zooms') });
    }
    const cs = getComputedStyle(document.getElementById('app'));
    return { out, dockKeyY: cs.getPropertyValue('--dock-key-y'), dockKeyH: cs.getPropertyValue('--dock-key-h') };
  }), null, 1));
};
