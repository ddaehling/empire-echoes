/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* w9sh-05-fit.js — the arithmetic of the time band at every disclosure level.
   Prints, per level: the region, the grid row, each column's content height,
   every stratum with its own margins, and the landmarks that must not move. */
const M = () => {
  const r = e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: +b.height.toFixed(1) }; };
  const tl = document.querySelector('.tl'); if (!tl) return { err: 'no .tl' };
  const cs = getComputedStyle(tl);
  const strat = (sel) => {
    const el = document.querySelector(sel); if (!el) return null;
    const s = getComputedStyle(el);
    return { r: r(el), sh: el.scrollHeight, gap: s.rowGap, mt: s.marginTop, mb: s.marginBottom,
      kids: [...el.children].filter(c => getComputedStyle(c).display !== 'none').map(c => {
        const k = getComputedStyle(c);
        return { c: (c.className || c.tagName) + '', r: r(c), mt: k.marginTop, mb: k.marginBottom, pt: k.paddingTop, pb: k.paddingBottom };
      }) };
  };
  return {
    stage: document.documentElement.getAttribute('data-stage'),
    tl: r(tl), client: tl.clientHeight, scroll: tl.scrollHeight,
    rows: cs.gridTemplateRows, cols: cs.gridTemplateColumns, rowGap: cs.rowGap, pad: cs.paddingTop + '/' + cs.paddingBottom,
    deck: strat('.tl__deck'), body: strat('.tl__body'), now: strat('.tl__now'),
    ax: r(document.querySelector('.tl-ax')), spine: r(document.querySelector('.tl-spine')),
  };
};
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.store.dispatch('setPlaying', false));
  const seen = [];
  for (const level of ['plate', 'working', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(1000);
    const d = await page.evaluate(M); seen.push(d);
    const over = Math.max(0, +(d.scroll - d.client).toFixed(1));
    log(`[${level}] region=${d.client} row=${d.rows} scroll=${d.scroll} OVER=${over}` +
        `  deck=${d.deck.r.h} body=${d.body.r.h} now=${d.now.r.h}  ax.y=${d.ax.y} spine.y=${d.spine.y}`);
    if (over > 0.5) log(`   deck strata: ` + d.deck.kids.map(k => `${k.c.split(' ')[0]}=${k.r.h}(m${k.mt}/${k.mb})`).join(' '));
    if (over > 0.5) log(`   now strata:  ` + d.now.kids.map(k => `${k.c.split(' ')[0]}=${k.r.h}(m${k.mt}/${k.mb})`).join(' '));
  }
  const ys = seen.map(d => [d.ax.y, d.spine.y]);
  const moveAx = Math.max(...ys.map(a => a[0])) - Math.min(...ys.map(a => a[0]));
  const moveSp = Math.max(...ys.map(a => a[1])) - Math.min(...ys.map(a => a[1]));
  log(`MOVE axis=${moveAx}px spine=${moveSp}px   ` + (moveAx === 0 && moveSp === 0 ? 'PASS (b)' : 'FAIL (b)'));
  const maxOver = Math.max(...seen.map(d => d.scroll - d.client));
  log(`CLIP max=${maxOver.toFixed(1)}px  ` + (maxOver <= 0.5 ? 'PASS (a)' : 'FAIL (a)'));
};
