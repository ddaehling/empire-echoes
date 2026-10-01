/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  log(await page.evaluate(() => {
    const p = document.querySelector('.map');
    const out=[];
    const walk=(el,d)=>{ if(d>4) return; out.push('  '.repeat(d)+el.tagName+'.'+(el.getAttribute('class')||'')+' kids='+el.children.length); [...el.children].slice(0,25).forEach(c=>walk(c,d+1)); };
    walk(p,0); return out.join('\n');
  }));
  log('targets sample:', await page.evaluate(()=>{
    const t=document.querySelector('.map__targets');
    if(!t) return 'none';
    return [...t.children].slice(0,6).map(c=>c.outerHTML.slice(0,300)).join('\n---\n') + '\nTOTAL '+t.children.length;
  }));
};
