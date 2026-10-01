/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1858'; });
  await page.waitForTimeout(900);
  const a = await page.evaluate(() => {
    const slot = document.querySelector('.time__slot');
    const out = [];
    slot.querySelectorAll('button,[tabindex],a,select,input,[role]').forEach(e=>{
      const r=e.getBoundingClientRect();
      out.push({tag:e.tagName, role:e.getAttribute('role'), ti:e.getAttribute('tabindex'), label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,60), w:Math.round(r.width),h:Math.round(r.height), live:e.getAttribute('aria-live')});
    });
    const lives = [...document.querySelectorAll('[aria-live]')].map(e=>e.getAttribute('aria-live')+':'+(e.className||e.id));
    return {n:out.length, els:out.slice(0,40), lives};
  });
  log(JSON.stringify(a,null,1).slice(0,6000));
  // tab through
  await page.evaluate(()=>document.body.focus());
  const seq=[];
  for(let i=0;i<28;i++){ await page.keyboard.press('Tab'); seq.push(await page.evaluate(()=>{const e=document.activeElement; const r=e.getBoundingClientRect(); return e.tagName+'['+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40)+'] '+Math.round(r.width)+'x'+Math.round(r.height);})); }
  log('TAB ORDER:\n'+seq.join('\n'));
};
