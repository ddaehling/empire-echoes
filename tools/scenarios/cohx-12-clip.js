/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1800);
  log(JSON.stringify(await page.evaluate(() => {
    const b = e => e ? (r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect()) : null;
    const q = s => document.querySelector(s);
    const sb = q('.map__switchbody') || q('.map__switch > div');
    const out = {};
    out.readout = (()=>{const e=q('.map__switch'); return e&&{...b(e), cls:e.className, kids:[...e.children].map(c=>c.className+' h='+Math.round(c.getBoundingClientRect().height))};})();
    out.body = (()=>{ const e=[...document.querySelectorAll('.map__switch *')].find(x=>x.scrollHeight>x.clientHeight+4); return e && {cls:e.className, ch:e.clientHeight, sh:e.scrollHeight, ov:getComputedStyle(e).overflow, txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,120)};})();
    out.defwords = [...document.querySelectorAll('.map__defword')].map(e=>({t:e.innerText, cw:e.clientWidth, sw:e.scrollWidth}));
    out.rail = [...document.querySelectorAll('.map__rail > *, .map__furniture > *')].map(e=>e.className+' '+JSON.stringify(b(e)));
    out.spine = [...document.querySelectorAll('[class*=spine] [class*=band], [class*=phase]')].filter(e=>e.offsetParent).map(e=>({c:e.className.slice(0,40), t:(e.innerText||'').replace(/\s+/g,' ').slice(0,40), cw:e.clientWidth, sw:e.scrollWidth}));
    out.head = (()=>{const e=q('.tl__changehead'); return e&&{...b(e), ch:e.clientHeight, sh:e.scrollHeight, ov:getComputedStyle(e).overflow, kids:[...e.children].map(c=>c.className+' '+JSON.stringify(b(c)))};})();
    return out;
  }), null, 1));
};
