/* P21 round-3 baseline: the through-line at every width, inside a beat. */
const STEPS = [1, 9, 17, 23];

module.exports = async ({ page, shot, log }) => {
  for (const s of STEPS) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1700);
    const r = await page.evaluate(() => {
      const R = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), disp: c.display, vis: c.visibility, hidden: e.hidden }; };
      const app = document.getElementById('app');
      const say = document.querySelector('.cl-say');
      let clause = null;
      if (say) {
        const box = say.getBoundingClientRect();
        const gs = [...say.querySelectorAll('.cl-say__g')];
        clause = {
          total: gs.length,
          fullyVisible: gs.filter((g) => { const r = g.getBoundingClientRect(); return r.left >= box.left - 1 && r.right <= box.right + 1; }).length,
          scrollW: say.scrollWidth, clientW: say.clientWidth, scrollLeft: Math.round(say.scrollLeft),
          more: say.dataset.more || '', filled: say.dataset.filled,
          text: (say.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        };
      }
      const blk = document.querySelector('.cl-blk');
      let blkInfo = null;
      if (blk) { const b = blk.getBoundingClientRect(); blkInfo = { y: Math.round(b.y), h: Math.round(b.h || b.height), inView: b.top < innerHeight && b.bottom > 0 }; }
      const scroller = document.querySelector('.tr-panel__scroll');
      const canvas = document.querySelector('.stage__map canvas, .stage__map svg');
      return {
        foot: app.dataset.foot, dock: app.dataset.dock, rail: app.dataset.rail, path: app.dataset.path,
        clBar: R('.cl-bar'), clSay: R('.cl-say'), clause, blk: blkInfo,
        stageMap: R('.stage__map'), drawn: canvas ? (() => { const b = canvas.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })() : null,
        panelScroll: scroller ? { client: scroller.clientHeight, scroll: scroller.scrollHeight } : null,
        time: R('.app__time'),
      };
    });
    log('STEP ' + s + ' ' + JSON.stringify(r));
    await shot('step' + s);
  }
};
