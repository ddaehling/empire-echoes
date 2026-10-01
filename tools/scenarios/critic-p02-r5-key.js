/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1866&sel=new-zealand', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  log('caveat clipped?', await page.evaluate(()=>[...document.querySelectorAll('.map__caveat')].map(e=>{
    const r=e.getBoundingClientRect(); let p=e.parentElement, clip=null;
    while(p&&p!==document.body){const cs=getComputedStyle(p); if(cs.overflow!=='visible'||cs.overflowY!=='visible'){const pr=p.getBoundingClientRect(); clip=(p.className||'')+' rect '+Math.round(pr.y)+'-'+Math.round(pr.bottom)+' oy='+cs.overflowY; break;} p=p.parentElement;}
    return {y:Math.round(r.y),h:Math.round(r.height), clip, hiddenBy: (r.y<0||r.y>innerHeight)?'offscreen':'onscreen'};
  })).then(JSON.stringify));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Open the full key/.test(b.innerText)); if(b)b.click();});
  await page.waitForTimeout(1500);
  await shot('fullkey');
  log('after open, page text has confiscations?', await page.evaluate(()=>/confiscations have no line here/.test(document.body.innerText)));
  log('visible text sample:', await page.evaluate(()=>{
    const t=document.body.innerText; const i=t.indexOf('confiscations have no line');
    return i>=0?t.slice(i-300,i+300):'not in text';
  }));
};
