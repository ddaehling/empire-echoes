/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out = { docH: document.documentElement.scrollHeight, winH: innerHeight, winW: innerWidth };
    const q = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return {top: Math.round(b.top), h: Math.round(b.height), w: Math.round(b.width)}; };
    out.el = {};
    for (const s of ['#app','#stage','.tl','[data-slot="timeline"]','#map','.map','.legend','main','header','footer','.statusbar']) out.el[s] = q(s);
    // list direct children of body / #app with sizes
    const kids = [];
    const app = document.querySelector('#app') || document.body;
    for (const c of app.children) { const b = c.getBoundingClientRect(); kids.push([c.tagName+'.'+c.className, Math.round(b.top), Math.round(b.height)]); }
    out.kids = kids;
    // where is the timeline slot in the DOM
    const tl = document.querySelector('.tl');
    if (tl) { let p = tl.parentElement, chain=[]; while(p && chain.length<8){ chain.push(p.tagName+'#'+p.id+'.'+p.className); p=p.parentElement;} out.chain = chain; }
    return out;
  });
  log(JSON.stringify(info, null, 1));
  await page.evaluate(() => document.querySelector('.tl')?.scrollIntoView({block:'center'}));
  await page.waitForTimeout(400);
  await shot('scrolled-to-timeline');
};
