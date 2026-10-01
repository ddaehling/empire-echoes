/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [1,5,8,9,14,17,21,23,24]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
    await page.waitForTimeout(1600);
    const r = await page.evaluate(()=>{
      const bar = document.querySelector('.bar, .chrome, header');
      if(!bar) return {n:-1};
      const els = [...bar.querySelectorAll('button,a[href],[role="button"]')].filter(e=>e.offsetParent && e.getBoundingClientRect().width>4);
      return {n: els.length, labels: els.map(e=>(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,22))};
    });
    log('step '+s+': '+r.n+'  ['+ (r.labels||[]).join(' | ') +']');
  }
};
