/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(600);
  await page.evaluate(()=>document.querySelector('.tl-chg--more')?.click());
  await page.waitForTimeout(600);
  log('sheet open:', await page.evaluate(()=>!document.querySelector('.tl-all')?.hidden));
  log('focus after open:', await page.evaluate(()=>document.activeElement.className));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  log('sheet after Esc:', await page.evaluate(()=>{const s=document.querySelector('.tl-all'); return s? (s.hidden?'closed':'STILL OPEN'):'gone';}));
  // sheet scrollability with a long popover
  await page.evaluate(()=>{const b=[...document.querySelectorAll('.tl-mark')].find(m=>/1941/.test(m.getAttribute('aria-label'))); if(b) b.click();});
  await page.waitForTimeout(600);
  log('pop metrics:', await page.evaluate(()=>{const p=document.querySelector('.tl__pop'); if(!p||p.hidden) return 'none'; const r=p.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,scrollH:p.scrollHeight,clientH:p.clientHeight,overflowY:getComputedStyle(p).overflowY, viewportH: innerHeight};}));
  // timeline-only render cost
  const t = await page.evaluate(async () => {
    const times=[];
    for (let i=0;i<200;i++){
      const t0=performance.now();
      window.BEA.bus.emit('time:year',{year:1700+i, changed:true});
      times.push(performance.now()-t0);
      await new Promise(r=>requestAnimationFrame(r));
    }
    times.sort((a,b)=>a-b); return {median:times[100], max:times[199]};
  });
  log('bus-only emit cost:', JSON.stringify(t));
};
