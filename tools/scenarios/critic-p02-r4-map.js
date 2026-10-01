/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const box = await page.evaluate(() => {
    const el = document.querySelector('#map') || document.querySelector('.map');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {x:r.x,y:r.y,w:r.width,h:r.height, id: el.id, cls: el.className};
  });
  log('MAPBOX:', JSON.stringify(box));
  if (box) await page.screenshot({ path: require('path').join(process.env.OUTDIR||'/tmp','x.png') }).catch(()=>{});
  await shot('mapel', '#map');
  // what's inside
  const info = await page.evaluate(() => {
    const svg = document.querySelector('#map svg');
    if (!svg) return {no:true, html: (document.querySelector('#map')||{}).outerHTML?.slice(0,1500)};
    const kids = [...svg.children].map(c => c.tagName + '.' + (c.getAttribute('class')||'') + ' n=' + c.children.length);
    return {viewBox: svg.getAttribute('viewBox'), kids, total: svg.querySelectorAll('*').length};
  });
  log('SVG:', JSON.stringify(info, null, 1).slice(0,3000));
  const labels = await page.evaluate(() => [...document.querySelectorAll('#map text')].map(t=>t.textContent.trim()).filter(Boolean).slice(0,120));
  log('LABELS:', JSON.stringify(labels));
};
