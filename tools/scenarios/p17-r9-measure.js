/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 9 — the legend's footprint, its names, its type sizes and its
   red-ink count, at this viewport, cold and after one interaction. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0, 120)));

  const probe = () => page.evaluate(() => {
    const q = s => document.querySelector(s);
    const rr = n => { if (!n) return null; const b = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
        on: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 1 && b.height > 1 }; };
    const vis = (n) => { if (!n) return false; const b = n.getBoundingClientRect(); const cs = getComputedStyle(n);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 1 && b.height > 1
        && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth; };
    const key = q('.legend--ribbon');
    let seen = 0, pts = 0;
    if (key) { const b = key.getBoundingClientRect();
      for (let i = 0; i < 5; i++) { const x = b.x + 6 + (b.width - 12) * i / 4, y = b.y + b.height / 2;
        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) continue;
        pts++; const e = document.elementFromPoint(x, y); if (e && key.contains(e)) seen++; } }
    const ribs = [...document.querySelectorAll('.legend__rib')].map(r => ({
      t: (r.querySelector('.legend__rib-w') || {}).textContent || '',
      n: (r.querySelector('.legend__rib-n') || {}).textContent || null,
      tier: r.dataset.tier, hidden: !!r.hidden }));
    const drawn = ribs.filter(r => !r.hidden);
    /* every visible element the LEGEND owns, its type size, and whether it is
       accent-coloured (a "red link") */
    const owned = [...document.querySelectorAll('.legend, .legend *, .byline, .byline *, .lsheet, .lsheet *')];
    const sizes = new Set(); let words = 0; let ctrls = 0;
    const reds = [];
    for (const n of owned) {
      if (!vis(n)) continue;
      const cs = getComputedStyle(n);
      const own = [...n.childNodes].filter(c => c.nodeType === 3).map(c => c.textContent.trim()).join(' ').trim();
      if (own) { sizes.add(parseFloat(cs.fontSize)); words += own.split(/\s+/).filter(Boolean).length; }
      if (n.matches('button,a[href],[tabindex]:not([tabindex="-1"]),input,select')) {
        ctrls++;
        const c = cs.color;
        if (/^rgb\(\s*(1[6-9]\d|2[0-5]\d)\s*,\s*\d{1,2}\s*,/.test(c) || cs.backgroundColor.match(/^rgb\(\s*(1[5-9]\d|2[0-5]\d)/)) reds.push((n.textContent || '').trim().slice(0, 40) + ' | ' + c);
      }
    }
    const app = q('#app');
    return {
      vp: innerWidth + 'x' + innerHeight,
      stage: app.dataset.stage, dossier: app.dataset.dossier, sheet: app.dataset.sheet,
      key: rr(key), keyVisiblePts: pts ? seen + '/' + pts : 'offscreen',
      host: key ? (key.parentElement.className || '') : null,
      say: q('.legend__say') ? q('.legend__say').textContent.trim() : null,
      route: [...document.querySelectorAll('.legend__route, .legend__open')].filter(vis).map(n => n.textContent.trim()),
      totalRibs: ribs.length,
      NAMED: drawn.filter(r => r.tier !== 'bare' && r.t).map(r => r.t + (r.n ? ' ' + r.n : '')),
      drawnUnnamed: drawn.filter(r => r.tier === 'bare').length,
      byline: rr(q('#legend-byline')) || rr(q('.byline')),
      legendWords: words, legendCtrls: ctrls, legendSizes: [...sizes].sort((a,b)=>a-b), legendReds: reds,
      fit: key ? key.dataset.fit + '/' + key.dataset.tier : null,
      docOver: document.documentElement.scrollHeight - innerHeight,
      stageRect: rr(q('.app__stage')), keyRow: rr(q('.stage__key')),
      canvas: (() => { const c = q('.stage__map canvas') || q('.map canvas') || q('canvas'); return c ? rr(c) : null; })(),
    };
  });

  const U = 'http://localhost:8777/app/';
  const at = async (tag, url, after) => {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    if (after) { try { await after(); } catch (e) { log(tag + ' AFTER-FAILED ' + e.message); } await page.waitForTimeout(1000); }
    const p = await probe();
    log(tag + ' ' + JSON.stringify(p));
    await shot(tag);
    return p;
  };

  await at('01-cold', U);
  await at('02-working', U, async () => {
    const b = await page.$('button[title*="+1"], button:has-text("+1")');
    if (b) await b.click(); else await page.click('.stage__map canvas', { position: { x: 400, y: 200 } });
  });
  await at('03-apparatus', U + '#filter=stage:apparatus');
  await at('04-sheet', U + '#filter=stage:apparatus', async () => {
    const b = await page.$('.legend__route, .legend__open');
    if (b) await b.click();
  });
  log('ERRORS ' + JSON.stringify(errs));
};
