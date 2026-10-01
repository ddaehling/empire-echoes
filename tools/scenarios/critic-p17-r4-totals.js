/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1922', {waitUntil:'load'});
  await page.waitForTimeout(2800);
  await page.getByText(/Open the full key/i).first().click();
  await page.waitForTimeout(1000);
  const b = page.getByText(/HOW THESE TOTALS ARE COUNTED/i).first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(700); await b.scrollIntoViewIfNeeded(); }
  const b2 = page.getByText(/HOW LONG IT HAD BEEN HELD/i).first();
  if (await b2.count()) { await b2.click(); await page.waitForTimeout(700); }
  const b3 = page.getByText(/LEGAL FORMS NOT ON THE PLATE/i).first();
  if (await b3.count()) { await b3.click(); await page.waitForTimeout(700); }
  const t = await page.evaluate(()=>{const p=document.querySelector('.lplate'); const s=p.innerText; const i=s.indexOf('HOW THESE TOTALS'); return s.slice(i, i+4000);});
  log('>>>\n'+t);
  await shot('totals');
};
