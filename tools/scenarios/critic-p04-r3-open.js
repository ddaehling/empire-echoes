/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2000);
  await shot('landing');
  log('URL:', page.url());
  // Try to close onboarding if present
  const body = await page.evaluate(() => document.body.innerText);
  log('BODY(0-1500):', body.slice(0,1500));
  // navigate directly
  await page.evaluate(() => { location.hash = '#year=1857&sel=bengal'; });
  await page.waitForTimeout(2500);
  await shot('bengal-1857');
  log('AFTER-HASH URL:', page.url());
  const d = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"], #dossier, .dossier');
    return el ? { found: true, cls: el.className, text: el.innerText.slice(0,4000), rect: el.getBoundingClientRect().toJSON() } : { found:false, html: document.body.innerHTML.slice(0,2000) };
  });
  log('DOSSIER:', JSON.stringify(d).slice(0,6000));
};
