/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* w9sh-20-contrast.js — WCAG 2.2 AA contrast, measured on the running app, for
   every text-bearing element in the modules this agent owns.
   Owned prefixes: tl / tl- (timeline), map / map- (map), cx- (chrome.css's
   shared chrome), bar__ app__ stage__ sheet__ mount (layout.css/chrome.css).
   Prints one row per FAILING element and a summary. */
const SWEEP = (ownedOnly) => {
  const OWNED = /^(tl|tl-[a-z]+|map|map-[a-z]+|cx-[a-z]+|bar|app|stage|sheet|mount|legend)(__|--|$)/;
  const parseRGB = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };

  const pageBg = parseRGB(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const backdropOf = (el) => {
    let n = el, stack = [];
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n); const bg = parseRGB(c.backgroundColor);
      if (bg && bg.a > 0) { stack.push(bg); if (bg.a >= 0.999) break; }
      n = n.parentElement;
    }
    let base = (pageBg.a >= 0.999) ? pageBg : { r: 255, g: 255, b: 255, a: 1 };
    const html = parseRGB(getComputedStyle(document.documentElement).backgroundColor);
    if (html && html.a >= 0.999) base = html;
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
    return base;
  };

  const rows = [];
  const seen = new Set();
  document.querySelectorAll('*').forEach((el) => {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!txt) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.15) return;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    const cls = (el.className && typeof el.className === 'string') ? el.className.split(/\s+/).filter(Boolean) : [];
    const owned = cls.some(c => OWNED.test(c));
    if (ownedOnly && !owned) return;
    const fg0 = parseRGB(cs.color); if (!fg0) return;
    const bg = backdropOf(el);
    const fg = over(fg0, bg);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3.0 : 4.5;
    const cr = ratio(fg, bg);
    const key = cls.join('.') + '|' + Math.round(size) + '|' + cs.color;
    if (seen.has(key)) return; seen.add(key);
    rows.push({ sel: (el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '')).slice(0, 70),
      cr: +cr.toFixed(2), need, size: +size.toFixed(1), weight,
      color: cs.color, bg: 'rgb(' + [bg.r, bg.g, bg.b].map(Math.round).join(',') + ')',
      pass: cr >= need - 0.005, txt: txt.slice(0, 34) });
  });
  return rows;
};

async function walk(page, log, label, ownedOnly) {
  const rows = await page.evaluate(SWEEP, ownedOnly);
  return rows.map(r => ({ ...r, where: label }));
}

const ONLY_OWNED = process.env.W9_ALL !== '1';
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  const all = [];
  const at = async (label, fn) => { try { await fn(); } catch (e) { log('  (skip ' + label + ': ' + e.message.slice(0, 60) + ')'); return; }
    await page.waitForTimeout(1100); all.push(...await walk(page, log, label, ONLY_OWNED)); };

  await at('plate', async () => { await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'plate' })); });
  await at('working', async () => { await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'working' })); });
  await at('apparatus', async () => { await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' })); });
  await at('territory', async () => { await page.evaluate(() => { location.hash = '#year=1913&sel=barbados&filter=stage:apparatus'; }); });
  await at('beat', async () => { await page.evaluate(() => { location.hash = '#tour=period&step=3'; }); });
  await at('beat9', async () => { await page.evaluate(() => { location.hash = '#tour=core&step=9'; }); });
  await at('year-sheet', async () => { await page.evaluate(() => { location.hash = '#year=1857'; }); 
    await page.waitForTimeout(700); const b = await page.$('.tl__warn, .tl__ends, .tl__more .cx-more'); if (b) await b.click({ force: true }); });
  await at('mark', async () => { await page.evaluate(() => { location.hash = '#year=1900&filter=stage:apparatus'; });
    await page.waitForTimeout(900); const m = await page.$$('.tl-mark'); if (m.length) await m[Math.floor(m.length/2)].click({ force: true }); });

  const press = (sel) => async () => { const b = await page.$(sel); if (!b) throw new Error('no ' + sel); await b.click({ force: true }); };
  await at('escape-sheet', async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); });
  await at('tools', press('.bar__tools-btn, [data-act="tools"], .bar__more'));
  await at('layers', press('.bar__layers, [data-act="layers"], .ly-open, a[href="#layers"]'));
  await at('defdial', async () => { await page.evaluate(() => { location.hash = '#year=1900&filter=stage:working'; });
    await page.waitForTimeout(800); const d = await page.$$('.map__def button, .map__defseg, .map__deflabel'); if (d[2]) await d[2].click({ force: true }); });
  await at('legend-more', press('.legend__more, .lg__more, .cx-more'));
  await at('hover', async () => { const el = await page.$('.map__hit, .map__unit, .stage__map svg path');
    if (!el) throw new Error('no map unit'); const b = await el.boundingBox(); if (!b) throw new Error('no box');
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); });
  await at('gate', async () => { await page.evaluate(() => { location.hash = '#tour=period&step=5'; }); });
  await at('close', async () => { await page.evaluate(() => { try { window.BEA.bus.emit('close:open', {}); } catch (e) {} location.hash = '#year=1997'; }); });

  const byKey = new Map();
  for (const r of all) { const k = r.sel + '|' + r.size + '|' + r.color + '|' + r.bg; if (!byKey.has(k)) byKey.set(k, r); }
  const rows = [...byKey.values()].sort((a, b) => a.cr - b.cr);
  const fails = rows.filter(r => !r.pass);
  log('=== measured ' + rows.length + ' distinct owned text styles; ' + fails.length + ' FAIL WCAG AA ===');
  for (const r of fails) log('FAIL ' + r.cr.toFixed(2) + ' / ' + r.need + '  ' + r.size + 'px w' + r.weight
    + '  ' + r.sel + '  fg=' + r.color + ' bg=' + r.bg + '  [' + r.where + '] "' + r.txt + '"');
  log('--- the fifteen tightest passes ---');
  for (const r of rows.filter(r => r.pass).slice(0, 15)) log('ok   ' + r.cr.toFixed(2) + ' / ' + r.need + '  ' + r.size + 'px  ' + r.sel);
};
