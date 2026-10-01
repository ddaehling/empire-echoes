/* The map's own size, with P21's through-line on screen and with it removed —
   the only honest way to say what this module costs the plate while another
   agent is changing the shell's own arithmetic in the same wave. */
module.exports = async ({ page, log }) => {
  for (const u of ['#tour=thirty&step=9', '']) {
    await page.goto('http://localhost:8777/app/' + u, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1900);
    const m = () => page.evaluate(() => {
      const c = document.querySelector('.stage__map canvas, .stage__map svg');
      const s = document.querySelector('.stage__map');
      const b = document.querySelector('.cl-bar');
      const k = document.querySelector('.cl-blk');
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); };
      return { drawn: R(c), rect: R(s), bar: R(b), spine: R(k), vp: innerWidth + 'x' + innerHeight,
        pct: s ? +(100 * s.getBoundingClientRect().width * s.getBoundingClientRect().height / (innerWidth * innerHeight)).toFixed(1) : null };
    });
    log((u || 'cold plate') + '  WITH P21: ' + JSON.stringify(await m()));
    await page.addStyleTag({ content: '.cl-blk,.cl-bar{display:none !important}' });
    await page.waitForTimeout(1400);
    log((u || 'cold plate') + '  P21 REMOVED: ' + JSON.stringify(await m()));
  }
};
