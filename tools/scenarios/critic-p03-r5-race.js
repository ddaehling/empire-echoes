/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message.slice(0,60)));
  await page.waitForTimeout(3500);
  const r = await page.evaluate(()=>{
    const sw=document.querySelector('.map__switch');
    const b=document.querySelector('.tl-rate__ask');
    const rc=b.getBoundingClientRect();
    const top=document.elementFromPoint(rc.x+rc.width/2, rc.y+rc.height/2);
    const ax=document.querySelector('.tl-ax__rail').getBoundingClientRect();
    const t2=document.elementFromPoint(ax.x+ax.width*0.9, ax.y+ax.height/2);
    return { painted: sw.scrollHeight, ask: top.className, axis90: t2.className };
  });
  log(JSON.stringify(r)+' errs='+errs.length);
};
