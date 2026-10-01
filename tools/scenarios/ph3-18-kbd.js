/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2500);
  // keyboard only: tab to Start the lesson
  let found=false;
  for (let i=0;i<25;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{const e=document.activeElement; if(!e)return null; const r=e.getBoundingClientRect();
      return {tag:e.tagName, lbl:(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,50), vis:r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight, box:`${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`};});
    log(`tab ${i+1}: ${f.tag} "${f.lbl}" visible=${f.vis} ${f.box}`);
    if (/Start the lesson/i.test(f.lbl)) { found=true; await page.keyboard.press('Enter'); break; }
  }
  log('reached Start via keyboard: '+found);
  await page.waitForTimeout(1800);
  await shot('kbd-beat1');
  log('step: '+await page.evaluate(()=>(document.body.innerText.match(/\d+ \/ \d+/)||[''])[0]));
  // tab through beat 1 and find Next
  const seq=[];
  for (let i=0;i<28;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{const e=document.activeElement; const r=e.getBoundingClientRect();
      const style=getComputedStyle(e);
      return {lbl:(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,45), y:Math.round(r.y), h:Math.round(r.height), off:(r.top<0||r.bottom>innerHeight), outline:style.outlineWidth+' '+style.outlineStyle};});
    seq.push(`${f.lbl} @y${f.y} h${f.h}${f.off?' OFFSCREEN':''} outline=${f.outline}`);
  }
  seq.forEach(s=>log('  '+s));
  await shot('kbd-focus');
  log('--- errors ---'); errs.forEach(e=>log(e));
};
