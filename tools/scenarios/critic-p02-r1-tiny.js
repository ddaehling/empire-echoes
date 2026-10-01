/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const ids = ['gibraltar','malta','ascension','barbados','aden','singapore','hong-kong-island','hong-kong'];
  const info = await page.evaluate((ids) => {
    const out = [];
    for (const id of ids) {
      const el = document.getElementById('map-u-'+id);
      if (!el) { out.push({id, missing:true}); continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const cx = r.x + r.width/2, cy = r.y + r.height/2;
      const top = document.elementFromPoint(cx, cy);
      out.push({id, w:+r.width.toFixed(1), h:+r.height.toFixed(1), x:+r.x.toFixed(0), y:+r.y.toFixed(0),
        pe: cs.pointerEvents, tabindex: el.getAttribute('tabindex'), aria: el.getAttribute('aria-label'),
        topAtCentre: top ? (top.id||top.className||top.tagName) : null });
    }
    // all targets: how many, and overlap stats
    const all = [...document.querySelectorAll('.map__target')];
    const sizes = all.map(e=>{const r=e.getBoundingClientRect(); return {id:e.dataset.unit, w:Math.round(r.width), h:Math.round(r.height)};});
    sizes.sort((a,b)=>b.w*b.h-a.w*a.h);
    return {out, count: all.length, biggest: sizes.slice(0,8), smallest: sizes.slice(-8)};
  }, ids);
  log('TINY:', JSON.stringify(info, null, 1).slice(0,4000));
  // Now try clicking Gibraltar
  const g = await page.$('#map-u-gibraltar');
  if (g) {
    const box = await g.boundingBox();
    log('gib box', JSON.stringify(box));
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
    await page.waitForTimeout(1200);
    await shot('after-click-gibraltar');
    log('url after click', page.url());
    log('selected?', await page.evaluate(()=>document.getElementById('map-u-gibraltar')?.getAttribute('aria-selected')));
  }
};
