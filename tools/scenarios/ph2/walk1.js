const R = require('../lib/routes.js');
const ROUTE = process.env.PH_ROUTE || 'lesson-one';

module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  const steps = await R.stepsOf(page, ROUTE);
  log('ROUTE ' + ROUTE + ' has ' + steps.length + ' steps');
  for (const s of steps) {
    await R.open(page, 'http://localhost:8777/app/', ROUTE, s.step);
    await page.waitForTimeout(1400);
    const m = await page.evaluate(() => {
      const vv = window.visualViewport || { width: innerWidth, height: innerHeight };
      const q = (sel) => document.querySelector(sel);
      const box = (sel) => { const n = q(sel); if (!n) return null; const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top), b: Math.round(b.bottom) }; };
      const scroller = [...document.querySelectorAll('#app *')].filter(n => {
        const st = getComputedStyle(n); const b = n.getBoundingClientRect();
        return b.height > 60 && n.scrollHeight - n.clientHeight > 8 && /auto|scroll/.test(st.overflowY);
      }).map(n => ({ cls: n.className && String(n.className).slice(0,40), h: Math.round(n.getBoundingClientRect().height), sh: n.scrollHeight }));
      // Next / Commit buttons and occlusion
      const btns = [...document.querySelectorAll('#app button:not([hidden])')].filter(b => {
        const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0;
      }).map(b => {
        const r = b.getBoundingClientRect();
        const cx = r.left + r.width/2, cy = r.top + r.height/2;
        const top = document.elementFromPoint(cx, cy);
        return { txt: (b.textContent||'').trim().slice(0,32), cls: String(b.className).slice(0,32),
          t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height),
          disabled: b.disabled,
          hit: top ? (b.contains(top) || top === b || b === top.closest('button')) : false,
          onscreen: r.top >= 0 && r.bottom <= vv.height + 1 };
      });
      return {
        vv: [Math.round(vv.width), Math.round(vv.height)],
        title: q('.cx-sheet__title')?.textContent?.trim().slice(0,80) || '',
        stage: document.documentElement.dataset.stage,
        read: document.documentElement.dataset.read,
        docScroll: document.documentElement.scrollHeight - window.innerHeight,
        lede: box('.app__lede'), map: box('.stage__map'), sheet: box('.app__sheet'), time: box('.app__time'),
        readable: box('.tr-panel__scroll'),
        readableSH: q('.tr-panel__scroll')?.scrollHeight || 0,
        scrollers: scroller,
        figures: [...document.querySelectorAll('.viz, .vz, [data-viz], .tr-fig, figure')].map(n=>{const b=n.getBoundingClientRect();return {cls:String(n.className).slice(0,30),w:Math.round(b.width),h:Math.round(b.height)};}).slice(0,6),
        btns,
        text: (q('.tr-panel__scroll')?.innerText || q('.app__sheet')?.innerText || '').replace(/\s+/g,' ').slice(0, 700),
      };
    });
    log('--- step ' + s.step + ' ' + s.kind + ':' + s.id + ' | "' + m.title + '"');
    log('    vv=' + m.vv + ' stage=' + m.stage + ' read=' + m.read + ' docScroll=' + m.docScroll);
    log('    lede=' + JSON.stringify(m.lede) + ' map=' + JSON.stringify(m.map) + ' sheet=' + JSON.stringify(m.sheet) + ' time=' + JSON.stringify(m.time));
    log('    readable=' + JSON.stringify(m.readable) + ' holding ' + m.readableSH + ' scrollers=' + m.scrollers.length + ' ' + JSON.stringify(m.scrollers));
    log('    figures=' + JSON.stringify(m.figures));
    for (const b of m.btns) log('    btn "' + b.txt + '" [' + b.cls + '] y=' + b.t + '-' + b.b + ' ' + b.w + 'x' + b.h + ' disabled=' + b.disabled + ' hit=' + b.hit + ' onscreen=' + b.onscreen);
    log('    TEXT: ' + m.text);
    await shot('s' + String(s.step).padStart(2,'0') + '-' + s.id);
  }
};
