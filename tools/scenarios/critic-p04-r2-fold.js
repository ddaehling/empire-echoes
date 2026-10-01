/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"]');
    if (!el) return {err:'no dossier'};
    const r = el.getBoundingClientRect();
    // find the scroll container
    const walk = [...el.querySelectorAll('*')].filter(n => n.scrollHeight > n.clientHeight + 4);
    return {
      rect: {x:r.x,y:r.y,w:r.width,h:r.height},
      vh: innerHeight, vw: innerWidth,
      scrollers: walk.slice(0,5).map(n=>({cls:n.className, sh:n.scrollHeight, ch:n.clientHeight})),
      truncated: [...el.querySelectorAll('*')].filter(n=>n.children.length===0 && n.scrollWidth>n.clientWidth+2).map(n=>n.textContent.slice(0,60)),
    };
  });
  log('INFO ' + JSON.stringify(info, null, 1));
  await shot('fold-1280');
  // check which named sections are visible without scrolling
  const vis = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"]');
    const r = el.getBoundingClientRect();
    const out = [];
    el.querySelectorAll('h1,h2,h3,h4,[class*=label],[class*=head]').forEach(n=>{
      const b=n.getBoundingClientRect();
      out.push({t:n.textContent.trim().slice(0,50), top:Math.round(b.top), inView: b.top>=r.top && b.bottom<=Math.min(r.bottom, innerHeight)});
    });
    return out;
  });
  log('HEADINGS ' + JSON.stringify(vis, null, 1));
};
