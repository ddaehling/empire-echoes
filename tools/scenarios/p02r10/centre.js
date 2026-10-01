/** p02r10/centre.js — how far the old fly-to put the subject off the band's
 *  centre, in the pixels of each viewport. cy is the plate frame's own centre
 *  in world units; the old code omitted it from view.y, so every fly-to was
 *  wrong by cy * base * k pixels, vertically, at every zoom. */
module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  for (const st of [9, 13, 17]) {
    await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(1400);
    const r = await page.evaluate(() => {
      const P = window.__map.plate, cam = P.camera();
      return { cy: +cam.cy.toFixed(2), base: +cam.base.toFixed(4), k: +P.view.k.toFixed(2),
        h: Math.round(cam.availH), off: Math.round(Math.abs(cam.cy) * cam.base * P.view.k) };
    });
    log('step ' + st + '  band h ' + r.h + '  frame centre cy=' + r.cy + ' world units  base ' + r.base + '  k ' + r.k
      + '  =>  the old fly-to was ' + r.off + 'px off the band centre (' + Math.round(100 * r.off / r.h) + '% of the band)');
  }
};
