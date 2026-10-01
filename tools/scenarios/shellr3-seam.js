/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shellr3-seam`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the seam between the plate and the panel at 900x700. */
/** shellr3-seam.js — the seam at the foot of the plate (LAYOUT_BUDGET §2A,
 *  `--dock-floor`). Drives the guided path by pressing Next and reports, per
 *  beat, the overlap between the floating transport dock and every control
 *  strip pinned along the foot of the plate, plus whether each of the four
 *  definitions of "British" is hit-testable where it is drawn. */
const RT = require('./lib/routes.js');

module.exports = async ({ page, shot, log }) => {
  /* ROUND 2 OF WAVE 9: this opened `#tour=thirty&step=1` — the full route,
     which no cold start runs. It drives the path by pressing Next from the
     first beat, and which route that is belongs to the app. */
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  const SEAM_ROUTE = (await RT.chosen(page))[0];
  log('seam: driving ' + SEAM_ROUTE + ' from its first beat');
  await page.goto(RT.href('http://localhost:8777/app/', SEAM_ROUTE, 1), { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);

  const probe = () => page.evaluate(() => {
    const vis = (e) => { if (!e) return null; const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null;
      return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const ov = (a, b) => (!a || !b) ? 0 : Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
    const dock = vis(document.querySelector('.tr-dock'));
    const out = { hash: location.hash, stage: document.getElementById('app').dataset.stage, dock, bad: [] };
    for (const sel of ['.map__switch', '.map__defs', '.map__foot', '.map__strip', '.map__modes', '.stage__key', '.cx-cta']) {
      const b = vis(document.querySelector(sel));
      const o = ov(dock, b);
      if (o > 0) out.bad.push({ sel, box: b, overlap: o });
    }
    out.defs = [...document.querySelectorAll('.map__def')].map((b) => {
      const r = b.getBoundingClientRect();
      if (r.width < 2) return { label: (b.textContent || '').trim(), hidden: true };
      const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
      const top = document.elementFromPoint(cx, cy);
      return { label: (b.textContent || '').trim().slice(0, 18),
        clickable: !!(top && (top === b || b.contains(top))),
        blockedBy: (top && !(top === b || b.contains(top))) ? String(top.className.baseVal !== undefined ? top.className.baseVal : top.className) : null };
    });
    const cta = document.querySelector('.cx-cta');
    out.cta = (cta && !cta.hidden) ? (cta.textContent || '').trim() : null;
    return out;
  });

  for (let i = 1; i <= 14; i++) {
    const p = await probe();
    log('BEAT ' + i + ' ' + JSON.stringify(p));
    if (i === 5 || i === 9) await shot('beat' + i);
    const next = await page.$('.tr-dock .tr-bar__next, .tr-bar__next');
    if (!next) { log('no Next at ' + i); break; }
    try { await next.click({ timeout: 2500 }); } catch (e) { log('Next blocked at ' + i + ': ' + e.message.split('\n')[0]); break; }
    await page.waitForTimeout(900);
  }
};
