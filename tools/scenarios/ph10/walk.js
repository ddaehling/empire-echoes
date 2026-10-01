/* ph10/walk.js — the phone critic walks the DEFAULT route beginning to end. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);

  const routes = await page.evaluate(() => (window.BEA && window.BEA.toursRoutes) || null);
  log('ROUTES ' + JSON.stringify(routes && routes.routes ? routes.routes.map(r => ({
    id: r.id, label: r.label, for: r.for, isDefault: r.isDefault, steps: r.steps,
    exact: r.minutesExact, exactMax: r.minutesExactMax, say: r.minutesSay, mid: r.minutes,
    fits: r.fitsPeriod, periods: r.periods, periodMinutes: r.periodMinutes,
    covers: (r.covers || []).length, recalled: (r.recalled || []).length,
    drops: (r.drops || []).length, floor: r.floor,
    room: r.roomMinutes, grey: r.greyLines,
  })) : null, null, 1));

  await shot('00-door');
  log('DOOR TEXT>>>\n' + (await page.evaluate(() => document.body.innerText)).slice(0, 1800) + '\n<<<');

  const start = page.locator('button:has-text("Start the lesson"), a:has-text("Start the lesson")').first();
  if (await start.count()) { await start.click(); } else { log('NO START BUTTON'); }
  await page.waitForTimeout(1100);

  const measure = () => page.evaluate(() => {
    const R = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const q = s => { const e = document.querySelector(s); return e ? R(e) : null; };
    const vw = innerWidth, vh = innerHeight;
    const out = { vw, vh, read: document.documentElement.getAttribute('data-read'),
      scrollH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth };
    out.map = q('.stage__map'); out.sheet = q('.app__sheet'); out.time = q('.app__time'); out.lede = q('.app__lede');
    const sc = document.querySelector('.tr-panel__scroll, .cx-sheet__scroll');
    out.scroller = sc ? { r: R(sc), sh: sc.scrollHeight, ch: sc.clientHeight } : null;
    /* every visible control, its size, and whether it is the topmost thing at its own centre */
    const ctrls = [];
    document.querySelectorAll('button,a[href],input,select,summary,[role="button"],[tabindex="0"]').forEach(e => {
      const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || b.width < 2 || b.height < 2) return;
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const inVp = cx >= 0 && cx <= vw && cy >= 0 && cy <= vh;
      const top = inVp ? document.elementFromPoint(cx, cy) : null;
      ctrls.push({ t: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 44),
        r: R(e), inVp, occl: inVp ? !(top === e || e.contains(top) || (top && top.contains(e))) : null,
        small: b.width < 44 || b.height < 44 });
    });
    out.ctrls = ctrls;
    out.text = document.body.innerText.replace(/\n{3,}/g, '\n\n');
    return out;
  });

  const report = async (tag) => {
    const m = await measure();
    log('--- ' + tag + ' ---');
    log('geom ' + JSON.stringify({ read: m.read, map: m.map, sheet: m.sheet, time: m.time, lede: m.lede,
      scroller: m.scroller, scrollH: m.scrollH, scrollW: m.scrollW, vw: m.vw, vh: m.vh }));
    const occl = m.ctrls.filter(c => c.occl);
    const small = m.ctrls.filter(c => c.small);
    if (occl.length) log('!! OCCLUDED CONTROLS ' + JSON.stringify(occl));
    if (small.length) log('!! SMALL TARGETS ' + JSON.stringify(small));
    if (m.scrollW > m.vw + 1) log('!! HORIZONTAL SCROLL ' + m.scrollW + ' > ' + m.vw);
    log('TEXT>>>\n' + m.text + '\n<<<');
    await shot(tag);
    return m;
  };

  for (let i = 1; i <= 26; i++) {
    const tag = String(i).padStart(2, '0') + '-step';
    const m = await report(tag);
    const next = page.locator('button:has-text("Next"), button:has-text("Go on"), .tr-panel__next').first();
    if (!(await next.count())) { log('NO NEXT at ' + tag + ' — end of run?'); break; }
    if (!(await next.isVisible().catch(() => false))) { log('NEXT INVISIBLE at ' + tag); break; }
    if (await next.isDisabled().catch(() => false)) {
      log('NEXT DISABLED at ' + tag + ' — a gate/recall. Answering.');
      const opts = page.locator('.tr-panel__scroll button, .cx-sheet__scroll button, [role="radio"]');
      const n = await opts.count(); log('  options ' + n);
      for (let k = 0; k < n; k++) {
        const t = ((await opts.nth(k).textContent().catch(() => '')) || '').trim().replace(/\s+/g, ' ');
        log('  opt ' + k + ': ' + t.slice(0, 70));
      }
      for (let k = 0; k < n; k++) {
        const o = opts.nth(k);
        const t = ((await o.textContent().catch(() => '')) || '').trim();
        if (/next|back|map|skip|print/i.test(t)) continue;
        await o.click().catch(() => {}); await page.waitForTimeout(700);
        if (!(await next.isDisabled().catch(() => true))) break;
      }
      await shot(tag + '-answered');
      if (await next.isDisabled().catch(() => true)) { log('!! STILL DISABLED at ' + tag); }
    }
    await next.click({ timeout: 6000 }).catch(e => log('NEXT CLICK FAILED: ' + e.message));
    await page.waitForTimeout(950);
  }
  await report('99-end');
};
