/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* w9sh-01-clip.js — reproduce (a): time band children escaping their box in
   the apparatus disclosure level, and (b): the axis / phase bands MOVING
   between disclosure levels. Measures, prints numbers, takes no view. */
const MEASURE = () => {
  const band = document.querySelector('.app__time');
  if (!band) return { err: 'no .app__time' };
  const b = band.getBoundingClientRect();
  const cs = getComputedStyle(band);
  const out = [];
  const walk = (el) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { walk(c); continue; }
      const s = getComputedStyle(c);
      const paints = s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.01;
      const overTop = b.top - r.top, overBottom = r.bottom - b.bottom;
      const overL = b.left - r.left, overR = r.right - b.right;
      if (paints && (overTop > 0.5 || overBottom > 0.5 || overL > 0.5 || overR > 0.5)) {
        out.push({
          sel: c.tagName.toLowerCase() + '.' + String(c.className || '').split(' ').filter(Boolean).slice(0, 2).join('.'),
          rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
          overTop: +overTop.toFixed(1), overBottom: +overBottom.toFixed(1),
          overLeft: +overL.toFixed(1), overRight: +overR.toFixed(1),
        });
      }
      walk(c);
    }
  };
  walk(band);
  // key landmarks whose position must NOT change between levels
  const lm = {};
  for (const sel of ['.tl__axis', '.tl-band', '.tl__band', '.tl-phases', '.tl__lanes', '.tl__scrub', '.tl-spine', '.spine-band']) {
    const e = document.querySelector(sel);
    if (e) { const r = e.getBoundingClientRect(); lm[sel] = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }
  }
  const phases = [...document.querySelectorAll('.app__time [class*="phase"]')].slice(0, 8)
    .map(e => { const r = e.getBoundingClientRect(); return [e.className.split(' ')[0], Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; });
  return {
    band: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
    overflow: cs.overflow, timeH: getComputedStyle(document.documentElement).getPropertyValue('--time-h').trim(),
    scrollH: band.scrollHeight, clientH: band.clientHeight,
    escapees: out, landmarks: lm, phases,
  };
};

module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  // stop playback so nothing is animating
  await page.evaluate(() => { try { window.BEA.bus.emit('ask:play', { playing: false }); } catch (e) {} 
    try { window.BEA.store.dispatch('setPlaying', false); } catch (e) {} });
  await page.waitForTimeout(500);

  for (const level of ['plate', 'working', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(1100);
    log('--- stage=' + level + ' ---');
    log(JSON.stringify(await page.evaluate(MEASURE), null, 1));
    await shot('stage-' + level);
  }
};
