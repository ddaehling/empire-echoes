/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3000);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(500); }
  await page.keyboard.press('s'); await page.waitForTimeout(1500);
  await shot('stitch-only');
  // list the DOM targets and what they say
  const opts = await page.evaluate(() => {
    const o = [...document.querySelectorAll('.map__targets [role="option"], .map__targets button, .map__targets *[data-unit]')];
    return o.slice(0,12).map(e => ({ tag:e.tagName, role:e.getAttribute('role'), label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,160), unit:e.getAttribute('data-unit') }));
  });
  log('targets sample:', JSON.stringify(opts, null, 1).slice(0,2500));
  log('target count:', await page.evaluate(()=>document.querySelectorAll('.map__targets [role="option"]').length));
};
