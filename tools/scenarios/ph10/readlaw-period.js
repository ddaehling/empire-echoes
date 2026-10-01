/* The reading law's key measurements, applied to the DEFAULT route. */
module.exports = async ({ page, shot, log }) => {
  const base = 'http://localhost:8777/app/';
  for (let step = 1; step <= 10; step++) {
    await page.goto(base + '#tour=period&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store
      && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => {
      const R = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
      const q = s => { const e = document.querySelector(s); return e ? R(e) : null; };
      const app = document.querySelector('.app') || document.documentElement;
      /* the readable window = the scroller the beat prose is in */
      const sc = document.querySelector('.tr-panel__scroll') || document.querySelector('.qz') || document.querySelector('.cx-sheet__body');
      let anc = 0, chain = [];
      if (sc) {
        let n = sc.parentElement;
        while (n && n !== document.body) {
          const cs = getComputedStyle(n);
          if (/auto|scroll/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) { anc++; chain.push(String(n.className).slice(0, 30) + ' ' + n.clientHeight + '/' + n.scrollHeight); }
          n = n.parentElement;
        }
      }
      return { read: (document.documentElement.getAttribute('data-read') || app.getAttribute('data-read')),
        map: q('.stage__map'), sheet: q('.app__sheet'), time: q('.app__time'),
        win: sc ? { cls: String(sc.className).slice(0, 24), h: sc.clientHeight, content: sc.scrollHeight } : null,
        ancestors: anc, chain, docScroll: document.documentElement.scrollHeight > innerHeight + 1,
        title: (document.querySelector('.cx-sheet__head') || {}).innerText };
    });
    const screenfuls = m.win ? (m.win.content / m.win.h).toFixed(1) : '-';
    log('step ' + step + '  read=' + m.read + '  map=' + (m.map ? m.map.w + 'x' + m.map.h : '-')
      + '  sheet=' + (m.sheet ? m.sheet.h : '-') + '  time=' + (m.time ? m.time.h : '-')
      + '  WINDOW=' + (m.win ? m.win.h + ' holding ' + m.win.content + ' (' + screenfuls + ' screenfuls, ' + m.win.cls + ')' : 'none')
      + '  nestedScrollers=' + m.ancestors + (m.chain.length ? ' [' + m.chain.join(' | ') + ']' : '')
      + '  docScroll=' + m.docScroll
      + '  | ' + String(m.title || '').split('\n')[0]);
    await shot('p' + String(step).padStart(2, '0'));
  }
};
