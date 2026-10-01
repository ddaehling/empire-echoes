/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  // set year 2020
  await page.evaluate(()=>window.BEA.store.dispatch('setYear', 2020));
  await page.waitForTimeout(1200);
  await shot('y2020');
  const labels = await page.evaluate(()=>{
    const st=window.BEA.store.getState();
    return { year: st.year, labels: (window.BEA.map&&window.BEA.map.debugLabels)?window.BEA.map.debugLabels():null };
  });
  log('state', JSON.stringify(labels).slice(0,600));
  // legend chip accessible names
  const chips = await page.evaluate(()=>[...document.querySelectorAll('.app__key button,.app__key [role="button"],.lg-chip,.legend button')].map(e=>({t:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60), al:e.getAttribute('aria-label')||'', title:e.getAttribute('title')||''})));
  log('LEGEND CHIPS', JSON.stringify(chips));
  // expand legend
  const more = page.locator('button:has-text("more")').first();
  if (await more.count()) { await more.click().catch(()=>{}); await page.waitForTimeout(700); await shot('legend-open'); }
  const chips2 = await page.evaluate(()=>[...document.querySelectorAll('button,[role="button"]')].filter(e=>e.offsetParent).map(e=>({t:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50), al:e.getAttribute('aria-label')||''})).filter(x=>/deg|°/.test(x.t+x.al)||/\d+\s*$/.test(x.t)));
  log('CHIPS AFTER', JSON.stringify(chips2).slice(0,2000));
  const bad = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('*').forEach(e=>{
      const al=e.getAttribute&&e.getAttribute('aria-label');
      if (al && /deg\b|°/.test(al)) out.push(al.slice(0,80));
    });
    return [...new Set(out)];
  });
  log('ARIA WITH deg/°', JSON.stringify(bad));
  log('BODYTEXT', (await page.evaluate(()=>document.body.innerText)).slice(0,1200));
};
