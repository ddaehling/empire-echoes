/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  const tl = await page.evaluate(() => {
    const el = document.querySelector('.timeline, #timeline, [data-module="timeline"], .timeline-root');
    if (!el) return { found: false, candidates: [...document.querySelectorAll('*')].filter(n=>/timeline|scrub|spine/i.test(n.className||'')).slice(0,20).map(n=>n.tagName+'.'+n.className) };
    const r = el.getBoundingClientRect();
    return { found: true, cls: el.className, rect: {x:r.x,y:r.y,w:r.width,h:r.height}, text: el.innerText.slice(0,2000) };
  });
  log('timeline:', JSON.stringify(tl).slice(0,3000));
  log('body text:', (await page.evaluate(() => document.body.innerText)).slice(0, 3000));
};
