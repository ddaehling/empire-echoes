/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const out = [];
    const walk = (el, d) => {
      if (d > 3) return;
      for (const c of el.children) {
        const b = c.getBoundingClientRect();
        out.push({ d, tag: c.tagName, cls: (c.className||'').toString().slice(0,60), h: Math.round(b.height), y: Math.round(b.y), sh: c.scrollHeight });
        walk(c, d + 1);
      }
    };
    walk(document.body, 0);
    return { out, appCS: (()=>{const a=document.querySelector('.app'); if(!a) return null; const cs=getComputedStyle(a); return {h:cs.height, gtr:cs.gridTemplateRows, gta:cs.gridTemplateAreas.slice(0,200), disp:cs.display};})() };
  });
  log('APP: ' + JSON.stringify(r.appCS));
  log(r.out.map(o => `${' '.repeat(o.d*2)}${o.tag}.${o.cls} h=${o.h} y=${o.y} sh=${o.sh}`).join('\n'));
};
