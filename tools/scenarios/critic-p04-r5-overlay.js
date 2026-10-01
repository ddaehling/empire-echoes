/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    // what element is on top at a point inside the dossier column
    const pts = [[1700,300],[1700,600],[1200,400]];
    return pts.map(([x,y]) => {
      const el = document.elementFromPoint(x/2, y/2); // viewport 1440x900; scale guess
      return null;
    });
  });
  const top = await page.evaluate(() => {
    const out = [];
    for (const [x,y] of [[1200,200],[1200,400],[1200,700],[1100,600]]) {
      const el = document.elementFromPoint(x,y);
      out.push({x,y, tag: el && el.tagName, cls: el && el.className && String(el.className).slice(0,80), id: el&&el.id,
        path: (()=>{let p=[],n=el;while(n&&p.length<5){p.push((n.tagName||'')+(n.id?'#'+n.id:'')+(n.className?'.'+String(n.className).split(' ')[0]:''));n=n.parentElement}return p.join(' < ')})() });
    }
    // list fixed/absolute high-z elements
    const hi = [...document.querySelectorAll('body *')].filter(n=>{
      const s=getComputedStyle(n); return (s.position==='fixed'||s.position==='absolute') && parseInt(s.zIndex||0)>0 && n.getBoundingClientRect().width>200;
    }).map(n=>({tag:n.tagName,cls:String(n.className).slice(0,60),z:getComputedStyle(n).zIndex,r:(r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}))(n.getBoundingClientRect()), txt:n.innerText.slice(0,40).replace(/\n/g,' ')}));
    return {out, hi};
  });
  log(JSON.stringify(top, null, 1).slice(0, 6000));
};
