const STEPS = (process.env.STEPS || '1,2,10,11,12').split(',');
const TOUR = process.env.TOUR || 'core';
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  for (const s of STEPS) {
    await page.evaluate((h) => { location.hash = h; }, '#tour=' + TOUR + '&step=' + s);
    await page.waitForTimeout(3200);
    const m = await page.evaluate(() => {
      const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top), b: Math.round(b.bottom), sh: e.scrollHeight }; };
      const app = document.getElementById('app');
      const scr = document.querySelector('.tr-panel__scroll') || document.querySelector('[data-read-window]') || document.querySelector('.cx-sheet__body');
      const sb = scr ? scr.getBoundingClientRect() : null;
      return {
        title: (document.querySelector('.cx-sheet__head') || {}).innerText || '',
        read: app && app.dataset.read, beatwork: app && app.dataset.beatwork,
        tourfit: document.documentElement.getAttribute('data-tour-fit'),
        map: r('.stage__map'), sheet: r('.app__sheet'), time: r('.app__time'),
        scroll: scr ? { cls: scr.className, h: Math.round(sb.height), sh: scr.scrollHeight, ratio: +(scr.scrollHeight / sb.height).toFixed(1) } : null,
        foot: !!document.querySelector('.tr-panel__foot'),
        footNext: !!document.querySelector('.tr-panel__foot .tr-panel__next'),
        clblk: r('.cl-blk'),
        clblkText: (document.querySelector('.cl-blk') || {}).innerText || '',
        commit: (() => { const b = [...document.querySelectorAll('.app__sheet button')].find(x => /commit|show me|that is my guess|check/i.test(x.textContent || '')); if (!b) return null; const q = b.getBoundingClientRect(); const host = scr ? scr.getBoundingClientRect() : { top: 0, bottom: innerHeight }; return { txt: (b.textContent||'').trim().slice(0,28), t: Math.round(q.top), h: Math.round(q.height), visiblePx: Math.max(0, Math.round(Math.min(q.bottom, host.bottom) - Math.max(q.top, host.top))) }; })(),
        bodyChildren: (() => { const bd = document.querySelector('.app__sheet .cx-sheet__body'); return bd ? [...bd.children].map(c => c.className.split(' ')[0] + ':' + Math.round(c.getBoundingClientRect().height)) : null; })(),
      };
    });
    log('STEP ' + s + ' ' + JSON.stringify(m));
    await shot('s' + s);
  }
};
