/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1600);
  for(let k=0;k<5;k++){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(weakens) it, sure$/i.test((x.getAttribute('aria-label')||'').trim())&&!x.disabled); if(b)b.click();}); await page.waitForTimeout(350);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>/tr-panel__next|tr-bar__next/.test(x.className)&&!x.disabled)[0]; if(b)b.click();}); await page.waitForTimeout(1300);}
  const r = await page.evaluate(()=>{
    // find all text nodes whose rect sits in the band y 620..700 (between cloze and timeline)
    const out=[];
    const walk=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while((n=walk.nextNode())){
      const t=n.textContent.trim(); if(!t) continue;
      const rg=document.createRange(); rg.selectNodeContents(n); const b=rg.getBoundingClientRect();
      if(b.height<1) continue;
      if(b.bottom>615 && b.top<665) out.push(`"${t.slice(0,60)}" @${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)} parent=${n.parentElement.className.toString().slice(0,50)}`);
    }
    const panel=document.querySelector('[aria-label*="scrollable"]');
    const pb=panel?panel.getBoundingClientRect():null;
    const tl=document.querySelector('.tl'); const tb=tl?tl.getBoundingClientRect():null;
    const cl=document.querySelector('[class*=cloze],[class*=thread],[class*=tr-line]');
    return {band:out, panel:pb?`${Math.round(pb.y)}..${Math.round(pb.bottom)} overflow=${getComputedStyle(panel).overflow}`:'none',
      tl:tb?`${Math.round(tb.y)}..${Math.round(tb.bottom)}`:'none'};
  });
  log('panel: '+r.panel); log('timeline: '+r.tl);
  r.band.forEach(x=>log('BAND: '+x));
  await shot('bleed');
  // zoom on the band
  await page.screenshot({path: require('path').join(process.env.SHOT_DIR||'/tmp', 'x.png')}).catch(()=>{});
};
