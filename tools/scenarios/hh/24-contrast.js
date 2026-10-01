/* hh/24-contrast — WCAG AA contrast on every visible text node in the lesson surfaces. */
module.exports = async ({ page, log }) => {
  const steps = (process.env.HHSTEPS || '1,4,6,8,10').split(',');
  const all = [];
  for (const s of steps) {
    await page.goto('http://localhost:8777/app/#tour=period&step=' + s, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2400);
    const bad = await page.evaluate(() => {
      const lum = (c) => { const [r,g,b] = c.map(v => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }); return 0.2126*r+0.7152*g+0.0722*b; };
      const parse = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return { rgb: p.slice(0,3), a: p.length > 3 ? p[3] : 1 }; };
      const bgOf = (el) => { let e = el; while (e) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0.5) return c.rgb; e = e.parentElement; } return [255,255,255]; };
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!el.childNodes.length) continue;
        const txt = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
        if (!txt) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fg = parse(cs.color); if (!fg) continue;
        const bg = bgOf(el);
        const L1 = lum(fg.rgb), L2 = lum(bg);
        const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
        const px = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700;
        const large = px >= 24 || (px >= 18.66 && bold);
        const need = large ? 3 : 4.5;
        if (ratio < need) out.push({ sel: el.tagName + '.' + String(el.className).split(' ')[0], ratio: +ratio.toFixed(2), need, px, txt: txt.slice(0, 60) });
      }
      return out;
    });
    for (const b of bad) all.push('step ' + s + ' | ' + b.ratio + ' (need ' + b.need + ') ' + b.px + 'px ' + b.sel + ' "' + b.txt + '"');
  }
  log(all.length ? all.join('\n') : 'NO CONTRAST FAILURES');
  log('total: ' + all.length);
};
