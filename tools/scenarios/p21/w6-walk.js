/**
 * p21/w6-walk.js — where the through-line actually is, step by step.
 * Reports, for every step of the authored path: does the block/strip exist,
 * how far down the panel's scroller it sits, and whether a student who never
 * scrolls can see it.
 */
module.exports = async ({ page, shot, log }) => {
  const N = +(process.env.STEPS || 24);
  for (let step = 1; step <= N; step += 1) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1400);
    const m = await page.evaluate(() => {
      const app = document.getElementById('app');
      const vis = (e) => { if (!e) return false; const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
      const blk = document.querySelector('.cl-blk');
      const bar = document.querySelector('.cl-bar');
      const sc = document.querySelector('.app__sheet .cx-sheet__body') || document.querySelector('.sheet__body');
      const say = document.querySelector('.cl-say');
      let off = null;
      if (blk && sc) off = Math.round(blk.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop);
      return {
        foot: app.dataset.foot, stage: app.dataset.stage, dock: app.dataset.dock,
        blk: vis(blk), bar: vis(bar),
        slots: blk ? blk.querySelectorAll('.cl-blk__gap,.cl-blk__filled').length : (document.querySelectorAll('.cl-say__g').length),
        host: blk && blk.parentElement ? (blk.parentElement.className || '').toString().slice(0, 40) : '-',
        scH: sc ? Math.round(sc.clientHeight) : 0,
        scAll: sc ? Math.round(sc.scrollHeight) : 0,
        off, lineOver: say ? say.scrollWidth - say.clientWidth : null,
      };
    });
    log('step ' + String(step).padStart(2) + ' foot=' + m.foot + ' stage=' + m.stage
      + ' blk=' + m.blk + ' bar=' + m.bar + ' slots=' + m.slots
      + ' host=' + m.host + ' panel ' + m.scH + '/' + m.scAll + ' blockAt=' + m.off
      + ' screensDown=' + (m.off && m.scH ? (m.off / m.scH).toFixed(1) : '-'));
  }
};
