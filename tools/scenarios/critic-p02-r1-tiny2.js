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
  const found = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.map__target')].map(e=>e.dataset.unit);
    const want = /aden|hong|gibr|malta|ascen|barbad|singap|bermud|st-helena/i;
    return { matches: all.filter(id=>want.test(id)), total: all.length };
  });
  log('IDS:', JSON.stringify(found));
  const overlay = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.mount, .mount--orphan')].map(e=>{const r=e.getBoundingClientRect(); return {cls:e.className, id:e.id, x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height), pe:getComputedStyle(e).pointerEvents, z:getComputedStyle(e).zIndex};});
    return els.filter(e=>e.w>0&&e.h>0).slice(0,25);
  });
  log('MOUNTS:', JSON.stringify(overlay));
  // Try clicking each named tiny unit by dispatching a real mouse click at centre
  const targets = ['gibraltar','malta','ascension','barbados','singapore'];
  for (const t of targets) {
    const el = await page.$('#map-u-'+t);
    if (!el) { log('no el '+t); continue; }
    const b = await el.boundingBox();
    await page.mouse.click(b.x+b.width/2, b.y+b.height/2);
    await page.waitForTimeout(500);
    const sel = await page.evaluate(()=>({hash:location.hash, sel:[...document.querySelectorAll('.map__target[aria-selected=true]')].map(e=>e.dataset.unit)}));
    log('click '+t+' ->', JSON.stringify(sel));
  }
  await shot('after-clicks');
};
