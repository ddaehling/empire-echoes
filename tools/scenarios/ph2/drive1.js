const R = require('../lib/routes.js');
const ROUTE = process.env.PH_ROUTE || 'lesson-one';

const state = () => window.__ph = (() => {
  const q = (s) => document.querySelector(s);
  const vis = (n) => { if (!n) return false; const b = n.getBoundingClientRect();
    return b.width > 2 && b.height > 2 && b.bottom > 0 && b.top < innerHeight && getComputedStyle(n).visibility !== 'hidden'; };
  const hit = (n) => { const b = n.getBoundingClientRect(); const cx=b.left+b.width/2, cy=b.top+b.height/2;
    if (cx<0||cy<0||cx>innerWidth||cy>innerHeight) return 'offscreen';
    const t = document.elementFromPoint(cx,cy); if (!t) return 'none';
    return (n===t||n.contains(t)||t.closest && t.closest('button')===n) ? 'ok' : ('OCCLUDED-by:'+String(t.className||t.tagName).slice(0,40)); };
  return {
    step: q('.tr-bar__pos')?.textContent?.trim() || q('.tr-bar')?.innerText?.replace(/\s+/g,' ').slice(0,20),
    title: q('.cx-sheet__title')?.textContent?.trim() || '',
    next: (() => { const n = q('.tr-bar__next'); return n ? { txt: n.textContent.replace(/\s+/g,''), dis: n.disabled, hit: hit(n) } : null; })(),
    footNext: (() => { const n = q('.tr-panel__next'); return n ? { txt: n.textContent.replace(/\s+/g,''), dis: n.disabled, hit: hit(n) } : null; })(),
    commits: [...document.querySelectorAll('.tr-go,.viz-ratio__commit,.tr-tension__go,.viz-hundred__commit,[class*=commit],.tr-field__cell')]
      .filter(vis).map(n => ({ cls: String(n.className).slice(0,34), txt:(n.textContent||'').trim().slice(0,24), dis:n.disabled, hit: hit(n) })),
    figs: [...document.querySelectorAll('.viz')].map(n=>{const b=n.getBoundingClientRect();return {cls:String(n.className).slice(0,26), w:Math.round(b.width),h:Math.round(b.height),t:Math.round(b.top),vis:vis(n)};}),
    readable: (()=>{const n=q('.tr-panel__scroll'); if(!n) return null; const b=n.getBoundingClientRect(); return {h:Math.round(b.height), sh:n.scrollHeight};})(),
    close: !!q('.cl-close'),
    danger: [...document.querySelectorAll('#app *')].filter(n=>/unearned|\[missing|\[defect/i.test(n.textContent||'') && n.children.length===0).map(n=>n.textContent.slice(0,60)),
  };
})();

module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  await page.evaluate(() => { try { localStorage.clear(); } catch(_){} });
  await page.reload({ waitUntil: 'load' });
  await R.ready(page);
  await page.waitForTimeout(1200);
  await page.goto('http://localhost:8777/app/#tour=' + ROUTE + '&step=1');
  await R.ready(page); await page.waitForTimeout(1500);

  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(state);
    log('== ' + s.step + ' | ' + s.title + ' | readable=' + JSON.stringify(s.readable));
    log('   next=' + JSON.stringify(s.next) + ' foot=' + JSON.stringify(s.footNext));
    if (s.commits.length) log('   commits=' + JSON.stringify(s.commits));
    if (s.figs.length) log('   figs=' + JSON.stringify(s.figs));
    if (s.danger.length) log('   !!DANGER TEXT: ' + JSON.stringify(s.danger));
    await shot('d' + String(i).padStart(2,'0'));
    if (s.close) { log('   >>> CLOSE REACHED'); break; }

    // If Next is locked, try to satisfy: click any visible commit-ish control
    if (s.next && s.next.dis) {
      // press the aux "Place it" affordance to scroll it into view
      await page.evaluate(() => { const n = document.querySelector('.tr-panel__next, .tr-bar__next'); if (n) n.click(); });
      await page.waitForTimeout(400);
      const did = await page.evaluate(() => {
        const cell = document.querySelector('.tr-field__cell');
        if (cell) { cell.scrollIntoView({block:'center'}); cell.click(); return 'field-cell'; }
        const go = document.querySelector('.tr-go');
        if (go) { const inp = document.querySelector('.tr-num'); if (inp) inp.value = '7'; go.scrollIntoView({block:'center'}); go.click(); return 'guess'; }
        const c = document.querySelector('.viz-ratio__commit');
        if (c) { c.scrollIntoView({block:'center'}); c.click(); return 'ratio'; }
        const skip = [...document.querySelectorAll('button')].find(b=>/rather (not|read)/i.test(b.textContent||''));
        if (skip) { skip.scrollIntoView({block:'center'}); skip.click(); return 'declined'; }
        return 'none';
      });
      log('   unlock attempt -> ' + did);
      await page.waitForTimeout(700);
      const after = await page.evaluate(() => { const n=document.querySelector('.tr-bar__next'); return n? {txt:n.textContent.replace(/\s+/g,''), dis:n.disabled}:null; });
      log('   after unlock next=' + JSON.stringify(after));
      await shot('d' + String(i).padStart(2,'0') + '-unlocked');
    }
    const moved = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      if (n && !n.disabled) { n.click(); return true; } return false;
    });
    if (!moved) { log('   !! STUCK — Next still disabled'); break; }
    await page.waitForTimeout(1500);
  }
  // Close details
  const c = await page.evaluate(() => {
    const n = document.querySelector('.cl-close') || document.querySelector('.app__sheet');
    return { text: (n?.innerText||'').replace(/\s+/g,' ').slice(0, 3000) };
  });
  log('CLOSE TEXT: ' + c.text);
  await shot('zz-close');
};
