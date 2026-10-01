/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — the responsive law in the 768-1024 band: the strip may never overlap
   the lede, and must stay whole (nothing half-drawn) at every width in it. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  const read = () => page.evaluate(() => {
    const r = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const over = (a, b) => { if (!a || !b) return 0; const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x); const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); return w > 0 && h > 0 ? Math.round(w * h) : 0; };
    const rib = r('.legend--ribbon'), pin = r('.legend__pin'), lede = r('.app__lede') || r('[data-mount="lede"]');
    const list = document.querySelector('.legend__ribbon-list');
    const say = document.querySelector('.legend__say');
    const cut = list ? Math.round(list.scrollWidth - list.clientWidth) : null;
    const chips = [...document.querySelectorAll('.legend__rib')].filter(n => !n.hidden);
    const box = list ? list.getBoundingClientRect() : null;
    const spill = box ? chips.filter(n => { const b = n.getBoundingClientRect(); return b.right > box.right + 1 || b.left < box.left - 1; }).map(n => n.textContent.trim()) : [];
    return {
      w: innerWidth, h: innerHeight,
      ribXLede: over(rib, lede), pinXLede: over(pin, lede),
      overrun: cut, spilled: spill,
      sayShown: say ? !say.hidden : null,
      chips: chips.map(n => n.textContent.trim().replace(/\s+/g, ' ')),
      route: (() => { const n = document.querySelector('.legend__route'); if (!n || n.hidden) return null; const b = n.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height) + ' "' + n.textContent.trim() + '"'; })(),
    };
  });
  for (const w of [768, 820, 900, 960, 1000, 1023]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(700);
    log('COLD ' + JSON.stringify(await read()));
  }
  /* the rail open, which is when the pinned copy exists */
  await page.evaluate(() => { location.hash = '#year=1900&place=india&layer=mechanism'; });
  for (const w of [768, 900, 1023]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(900);
    log('RAIL ' + JSON.stringify(await read()));
    await shot('band-rail-' + w);
  }
};
