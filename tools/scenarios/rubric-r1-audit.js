/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const a = await page.evaluate(async () => {
    const B = window.BEA || {};
    const out = {keys: Object.keys(B)};
    try { if (B.historiography && B.historiography.audit) out.audit = await B.historiography.audit(); } catch(e){ out.auditErr = String(e); }
    return out;
  });
  log('BEA>>' + JSON.stringify(a).slice(0,4000));
  // legend chip accessible names
  await page.goto('http://localhost:8777/app/#year=1900',{waitUntil:'load'});
  await page.waitForTimeout(2500);
  const chips = await page.evaluate(()=>[...document.querySelectorAll('.legend__chip, [class*=legend] button, [class*=key] button')].map(e=>({
    aria: e.getAttribute('aria-label'), txt: (e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60), cls:(e.className||'').toString().slice(0,40)
  })).slice(0,20));
  log('CHIPS>>'+JSON.stringify(chips,null,1));
  // year 2020 map labels
  await page.goto('http://localhost:8777/app/#year=2020',{waitUntil:'load'});
  await page.waitForTimeout(2800);
  await shot('y2020');
  const labs = await page.evaluate(()=>[...document.querySelectorAll('.map text, .map__label, [class*=label]')].map(e=>e.textContent.trim()).filter(Boolean).slice(0,120));
  log('LABELS2020>>'+JSON.stringify(labs));
};
