/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — geometry: the map rectangle, the key strip, the lede, overlap, tap targets. */
const R = (n) => n ? { x: Math.round(n.x), y: Math.round(n.y), w: Math.round(n.width), h: Math.round(n.height) } : null;
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(900);
  const grab = () => page.evaluate(() => {
    const r = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
    const over = (a, b) => { if (!a || !b) return 0; const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x); const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y); return w > 0 && h > 0 ? Math.round(w * h) : 0; };
    const map = r('.stage__map') || r('[data-mount="map"]');
    const key = r('.stage__key');
    const rib = r('.legend--ribbon');
    const lede = r('.app__lede') || r('[data-mount="lede"]');
    const small = [...document.querySelectorAll('.legend button, .legend a[href], .legend [role="button"]')]
      .map(n => { const b = n.getBoundingClientRect(); return { c: n.className, w: Math.round(b.width), h: Math.round(b.height) }; })
      .filter(x => x.w > 0);
    return {
      vp: { w: innerWidth, h: innerHeight },
      map: map && { ...map }, key, rib, lede,
      ribXLede: over(rib, lede), ribXMap: over(rib, map),
      fit: (document.querySelector('.legend--ribbon') || {}).dataset,
      chips: [...document.querySelectorAll('.legend__rib')].filter(n => !n.hidden).map(n => n.textContent.trim().replace(/\s+/g, ' ')),
      controls: small,
      docScrollX: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  const a = await grab();
  log('COLD ' + JSON.stringify({ vp: a.vp, map: R(a.map), key: R(a.key), rib: R(a.rib), lede: R(a.lede), ribXLede: a.ribXLede, ribXMap: a.ribXMap, chips: a.chips, controls: a.controls, overflowX: a.docScrollX }));
  await shot('cold');
  /* inside a beat of the authored path */
  await page.evaluate(() => { location.hash = '#tour=thirty&step=9'; });
  await page.waitForTimeout(1600);
  const b = await grab();
  log('BEAT9 ' + JSON.stringify({ map: R(b.map), key: R(b.key), rib: R(b.rib), ribXLede: b.ribXLede, chips: b.chips, controls: b.controls }));
  await shot('beat9');
};
