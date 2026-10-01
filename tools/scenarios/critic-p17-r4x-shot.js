/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('a-default');
  const b = page.locator('button', { hasText: /Open the full key|Open in the full key/ });
  if (await b.count()) { await b.first().click(); await page.waitForTimeout(1400); await shot('b-key'); }
  const t = await page.evaluate(()=>{ const o=document.querySelector('.app__overlay'); return o?o.innerText.slice(0,600):'(no overlay)'; });
  log(t);
  const leg = await page.evaluate(()=>{const l=document.querySelector('.legend');return l?l.innerText:'(none)';});
  log('LEGEND: ' + leg);
};
