/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{ const s=window.BEA.store; for(let y=1600;y<=1997;y+=7) s.dispatch('setYear', y); });
  await page.waitForTimeout(1000);
  const routes = await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>3;}).map(e=>(e.textContent||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,50)).filter(t=>/lesson|path|start|guided|walk/i.test(t)));
  log('lesson routes visible: '+JSON.stringify(routes));
  // open Teaching desk
  await page.evaluate(()=>{const b=document.querySelector('.tp-entry'); if(b) b.click();});
  await page.waitForTimeout(1500); await shot('desk');
  const deskRoutes = await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>3;}).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60)).filter(t=>/lesson|minute|path|route/i.test(t)));
  log('desk routes: '+JSON.stringify(deskRoutes));
  // Tools menu
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=document.querySelector('.bar__more'); if(b) b.click();});
  await page.waitForTimeout(900); await shot('tools');
  const tools = await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>3;}).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)));
  log('tools open, all visible controls: '+JSON.stringify(tools));
};
