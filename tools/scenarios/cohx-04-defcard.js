/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(1800);
  const info = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /more ↓/.test(b.innerText));
    let chain = [];
    let e = btn;
    while (e && e !== document.body) { const r = e.getBoundingClientRect();
      chain.push('<'+e.tagName.toLowerCase()+' class="'+(typeof e.className==='string'?e.className:'')+'"> '+[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)].join(',')+' sh='+e.scrollHeight+' ch='+e.clientHeight+' ov='+getComputedStyle(e).overflow);
      e = e.parentElement; }
    return chain.join('\n  ^ ');
  });
  log('MORE-BUTTON ANCESTRY:\n' + info);
  const txt = await page.evaluate(() => {
    const c = document.querySelector('.mapdef, .defcard, .map__defcard, .mapmodes') ;
    return c ? c.outerHTML.slice(0, 3000) : 'not found by guess';
  });
  log('GUESS:', txt);
  await shot('shot');
};
