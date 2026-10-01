/**
 * P09 at data-stage="working" with the sheet mounted — the state budget.js
 * never reaches. Run at 390x844, 768x1024, 900x700, 1024x640, 1366x768 and
 * 1440x900, light and dark. Prints PASS/FAIL per rule.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('.mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const b = document.querySelector('.mx-pp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('.mx-cp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);

  const m = await page.evaluate(() => {
    const R = (n) => { if (!n) return null; const b = n.getBoundingClientRect();
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const app = document.getElementById('app');
    const sheet = document.querySelector('.cx-sheet');
    const body = document.querySelector('.cx-sheet__body');
    const map = document.querySelector('.stage__map') || document.querySelector('.app__stage');
    const entry = document.querySelector('.mx-entry');
    const mx = document.querySelector('.mx');

    const s = R(sheet), mp = R(map);
    let overlap = 0;
    if (s && mp) {
      const w = Math.max(0, Math.min(s.x + s.w, mp.x + mp.w) - Math.max(s.x, mp.x));
      const h = Math.max(0, Math.min(s.y + s.h, mp.y + mp.h) - Math.max(s.y, mp.y));
      overlap = w * h;
    }
    /* anything inside the sheet wider than the sheet */
    const wide = [];
    if (mx) for (const n of mx.querySelectorAll('*')) {
      if (n.scrollWidth > n.clientWidth + 1 && n.clientWidth > 0
        && getComputedStyle(n).overflowX === 'visible') wide.push(n.className + ' ' + n.scrollWidth + '>' + n.clientWidth);
    }
    /* text below the 12px floor */
    const small = [];
    if (mx) for (const n of mx.querySelectorAll('*')) {
      if (!n.firstChild || n.firstChild.nodeType !== 3 || !n.textContent.trim()) continue;
      const fs = parseFloat(getComputedStyle(n).fontSize);
      if (fs < 11.9) small.push(n.className + ' ' + fs);
    }
    const eb = R(entry);
    return {
      vw: innerWidth, vh: innerHeight, rail: app.dataset.rail, stage: app.dataset.stage,
      sheet: s, body: R(body), map: mp, entry: eb,
      entryInView: eb ? (eb.x >= -1 && eb.x + eb.w <= innerWidth + 1 && eb.w > 0) : false,
      /* Below the shell's §5A breakpoint the whole masthead strip collapses
         into "Tools ▾" and every module's control goes with it. That is the
         shell's behaviour, not a stranded control: assert reachability, not
         a rectangle. */
      entryCollapsed: !!(entry && entry.closest('.bar__tools')
        && getComputedStyle(entry.closest('.bar__tools')).display === 'none'),
      entryInDom: !!entry,
      overlap, docOver: document.documentElement.scrollHeight - innerHeight,
      bodyScroll: body ? body.scrollHeight : 0, bodyClient: body ? body.clientHeight : 0,
      wide: wide.slice(0, 5), small: small.slice(0, 5),
      rails: document.querySelectorAll('.mx-pp__r').length,
      bands: document.querySelectorAll('.mx-cp__band').length,
      tabInTable: [...document.querySelectorAll('.mx-t [tabindex="0"]')].length,
    };
  });
  log('MEASURED ' + JSON.stringify(m));
  const P = (ok, name, got) => log((ok ? 'PASS  ' : 'FAIL  ') + name + '  ' + got);

  P(m.docOver <= 0, 'B4 no document scroll with the sheet open', m.docOver + 'px over');
  P(m.rail === 'sheet' ? true : m.overlap <= 4000,
    'B5 the sheet never covers the plate (side rail)', 'overlap ' + m.overlap + 'px2, rail=' + m.rail);
  P(m.body && m.body.h >= 280, 'B8 the sheet gets at least 280px', (m.body ? m.body.h : 0) + 'px');
  P(m.wide.length === 0, 'no horizontal overflow inside the sheet', JSON.stringify(m.wide));
  P(m.small.length === 0, 'no text below the 12px floor', JSON.stringify(m.small));
  P(m.rails >= 2, 'the people rails are drawn', m.rails + ' rows');
  P(m.tabInTable === 1, 'the table is one tab stop', String(m.tabInTable));
  P(m.entryInView || m.entryCollapsed,
    'the entry control is in the viewport, or inside the shell\u2019s collapsed Tools menu',
    JSON.stringify(m.entry) + ' collapsed=' + m.entryCollapsed + ' in ' + m.vw + 'px');
  P(m.bands >= 4, 'the counterparty bands are drawn', m.bands + ' bands');

  await shot('working');
};
