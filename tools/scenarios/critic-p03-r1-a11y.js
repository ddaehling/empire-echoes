/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(() => { location.hash = '#year=1857'; });
  await page.waitForTimeout(700);
  log('rail attrs:', await page.evaluate(() => {
    const r = document.querySelector('.tl-ax__rail'); const o = {};
    for (const a of r.attributes) o[a.name] = a.value.slice(0,200); return JSON.stringify(o, null, 1);
  }));
  // press right arrow on rail and capture the live region synchronously-ish
  await page.evaluate(() => document.querySelector('.tl-ax__rail').focus());
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  log('live now:', await page.evaluate(() => [...document.querySelectorAll('[aria-live="polite"],[aria-live="assertive"]')].map(n=>n.textContent.trim().slice(0,300)).filter(Boolean).join(' || ')));
  log('rail valuetext:', await page.evaluate(() => document.querySelector('.tl-ax__rail').getAttribute('aria-valuetext')));
  // contrast probe: lane IV unlit
  log('lane colours:', await page.evaluate(() => [...document.querySelectorAll('.tl-lane')].map(b => { const c = getComputedStyle(b); return b.dataset.phase + ' on=' + b.dataset.on + ' color=' + c.color + ' bg=' + c.backgroundColor + ' opacity=' + c.opacity; }).join(' | ')));
};
