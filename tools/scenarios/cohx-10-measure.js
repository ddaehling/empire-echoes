/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Measure the seams numerically so fixes are grounded.
const M = (page) => page.evaluate(() => {
  const g = s => document.querySelector(s);
  const box = e => e ? (r => ({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect()) : null;
  const out = {};
  out.byline = box(g('#legend-byline'));
  out.legend = box(g('.legend'));
  const sc = g('.legend__scroll');
  out.scroll = sc ? { ...box(sc), ch: sc.clientHeight, sh: sc.scrollHeight, pct: Math.round(sc.clientHeight/sc.scrollHeight*100) } : null;
  const sw = g('.map__switch');
  out.mapSwitch = sw ? { ...box(sw), ch: sw.clientHeight, sh: sw.scrollHeight, clipped: sw.classList.contains('is-clipped') } : null;
  out.more = (g('.map__more')||{}).innerText;
  out.enlarge = [...document.querySelectorAll('button')].filter(b=>/Enlarge/.test(b.innerText)).map(b=>b.innerText.replace(/\s+/g,' '))[0];
  out.openkey = [...document.querySelectorAll('button')].filter(b=>/full key|colour key/i.test(b.innerText)).map(b=>b.innerText.replace(/\s+/g,' '))[0];
  // timeline: does any text box overlap the tick axis?
  const axis = g('.tl__axis, .tl__ticks, [class*=ticks]');
  out.axis = box(axis);
  const rows = [...document.querySelectorAll('[class*=changes], [class*=row], [class*=card]')].filter(e=>e.offsetParent);
  out.overlapsAxis = axis ? rows.filter(e => { const a = axis.getBoundingClientRect(), b = e.getBoundingClientRect();
      return b.width>60 && b.height>10 && b.left < a.right && b.right > a.left && b.top < a.bottom && b.bottom > a.top; })
      .map(e => (typeof e.className==='string'?e.className:'').slice(0,40) + ' :: ' + (e.innerText||'').replace(/\s+/g,' ').slice(0,50)) : [];
  // clipped text: any element whose scrollHeight exceeds clientHeight and whose overflow is hidden and holds text
  out.slicedText = [...document.querySelectorAll('*')].filter(e => {
    const cs = getComputedStyle(e);
    if (cs.overflow === 'visible' || !e.offsetParent) return false;
    if (e.scrollHeight - e.clientHeight < 6 || e.clientHeight < 8) return false;
    if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') return false;
    return (e.innerText||'').trim().length > 8;
  }).slice(0,14).map(e => (typeof e.className==='string'?e.className:e.tagName).slice(0,44) + ` ch=${e.clientHeight} sh=${e.scrollHeight} :: ` + (e.innerText||'').replace(/\s+/g,' ').slice(0,60));
  // horizontally truncated buttons
  out.truncated = [...document.querySelectorAll('button,span,a')].filter(e => e.offsetParent && e.scrollWidth - e.clientWidth > 3 && e.clientWidth > 30 && (e.innerText||'').length > 6)
    .slice(0,16).map(e => (typeof e.className==='string'?e.className:e.tagName).slice(0,40) + ` cw=${e.clientWidth} sw=${e.scrollWidth} :: ` + (e.innerText||'').replace(/\s+/g,' ').slice(0,50));
  return out;
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1800);
  log('MEASURE:', JSON.stringify(await M(page), null, 1));
};
