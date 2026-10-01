module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const box = (sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), z: cs.zIndex, pos: cs.position, vis: cs.visibility, disp: cs.display }; }, sel);

  // --- SEAM 1: Enlarge + a mode key
  await page.keyboard.press('e');
  await page.waitForTimeout(800);
  await shot('enlarge');
  await page.keyboard.press('w');
  await page.waitForTimeout(900);
  await shot('enlarge-plus-weight');
  log('BYLINE', JSON.stringify(await box('.legend__byline, .lbyline, [class*=byline]')));
  log('WHAT IS AT Britain?', await page.evaluate(() => {
    const t = [...document.querySelectorAll('[data-unit]')].find(e => /^gb-|great-britain|uk-/.test(e.getAttribute('data-unit')));
    if (!t) return 'no britain target';
    const r = t.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2);
    return t.getAttribute('data-unit') + ' -> ' + (el ? el.tagName + '.' + el.className : 'null');
  }));
  await page.keyboard.press('w'); await page.keyboard.press('e'); await page.waitForTimeout(700);

  // --- SEAM 2: the counts, rendered three times
  log('COUNT SURFACES', JSON.stringify(await page.evaluate(() => {
    const grab = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\s+/g,' ').slice(0,200) : null; };
    return {
      legendHead: grab('.legend__totals, [class*=totals]'),
      furniture: grab('.map__furniture'),
      timelineHead: grab('.tl-year, [class*=tl-head], .time__slot > *'),
      stageNote: grab('[data-mount="stage-note"]'),
    };
  })));
  // clipped text detector
  log('CLIPPED', JSON.stringify(await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(e => {
      if (e.children.length) return;
      const t = (e.textContent||'').trim(); if (!t) return;
      const cs = getComputedStyle(e);
      if (cs.overflow === 'visible') return;
      if (e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0) out.push({ cls: (e.className||'').toString().slice(0,50), t: t.slice(0,60), sh: e.scrollHeight, ch: e.clientHeight });
    });
    return out.slice(0, 25);
  })));
  // overlapping floating cards over the plate
  log('PLATE OCCLUSION', JSON.stringify(await page.evaluate(() => {
    const plate = document.querySelector('canvas.map__plate') || document.querySelector('[data-mount="map"]');
    const pr = plate.getBoundingClientRect();
    const area = pr.width * pr.height;
    const floaters = [...document.querySelectorAll('.map__furniture, [data-mount="legend"] > *, [data-mount="stage-note"] > *')];
    return floaters.map(f => { const r = f.getBoundingClientRect();
      const ox = Math.max(0, Math.min(r.right, pr.right) - Math.max(r.left, pr.left));
      const oy = Math.max(0, Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top));
      return { cls: (f.className||'').toString().slice(0,40), pct: +(100 * ox*oy/area).toFixed(1), w: Math.round(r.width), h: Math.round(r.height) }; });
  })));
  // --- SEAM 3: focus rings
  log('FOCUS RINGS', JSON.stringify(await page.evaluate(() => {
    const seen = {};
    const els = [...document.querySelectorAll('button, [role=slider], a, [tabindex="0"]')].slice(0, 400);
    els.forEach(e => {
      const cs = getComputedStyle(e);
      const key = (e.className||'').toString().split(' ')[0] || e.tagName;
      if (seen[key]) return;
      seen[key] = { font: cs.fontFamily.split(',')[0], fs: cs.fontSize, radius: cs.borderRadius, border: cs.borderTopWidth + ' ' + cs.borderTopStyle, bg: cs.backgroundColor, minH: Math.round(e.getBoundingClientRect().height) };
    });
    return seen;
  })));
};
