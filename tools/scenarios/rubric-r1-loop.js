/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  await shot('loop-top');
  const info = await page.evaluate(()=>{
    const m = document.querySelector('[class*=mech], .mc-loop, svg[class*=loop], [class*=loop]');
    if(!m) return 'no loop node';
    const b=m.getBoundingClientRect();
    return {cls:(m.className||'').toString(), rect:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)], txt:m.innerText?.replace(/\s+/g,' ').slice(0,600)};
  });
  log('LOOP>>'+JSON.stringify(info));
  await page.evaluate(()=>{const m=document.querySelector('[class*=mech],[class*=loop]'); if(m) m.scrollIntoView({block:'center'});});
  await page.waitForTimeout(500);
  await shot('loop-view');
  // step it
  for (let i=0;i<4;i++){
    const c = await page.evaluate(()=>{
      const bs=[...document.querySelectorAll('button')].filter(b=>/step|next step|advance|cut|break/i.test(b.textContent||b.getAttribute('aria-label')||''));
      if(!bs.length) return null; bs[0].click(); return bs[0].textContent.trim().slice(0,50);
    });
    log('clicked: '+c);
    await page.waitForTimeout(700);
    await shot('loop-s'+i);
  }
};
