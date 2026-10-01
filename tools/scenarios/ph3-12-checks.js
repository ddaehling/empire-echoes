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
  page.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  await page.waitForTimeout(2500);
  // 1. year 2020 map labels — Cape Colony check
  await page.evaluate(()=>{location.hash='year=2020';});
  await page.waitForTimeout(2000);
  const labels = await page.evaluate(()=>[...document.querySelectorAll('.map text, svg text')].map(t=>t.textContent.trim()).filter(Boolean));
  log('2020 labels: ' + labels.join(' | '));
  log('Cape Colony present at 2020: ' + labels.some(l=>/Cape Colony/i.test(l)));
  await shot('y2020');
  // 2. legend chip accessible names — degree leak
  const chips = await page.evaluate(()=>[...document.querySelectorAll('.legend button, [class*=legend] button, [class*=key] button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,110)));
  chips.forEach(c=>log('chip: '+c));
  log('deg leak: ' + chips.filter(c=>/deg\b|°/.test(c)).join(' || '));
  // 3. unlabeled buttons anywhere
  const unl = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent && !(b.getAttribute('aria-label')||b.textContent||'').trim()).map(b=>b.className));
  log('unlabelled visible buttons: ' + JSON.stringify(unl));
  log('--- errors ---'); errs.forEach(e=>log(e));
};
