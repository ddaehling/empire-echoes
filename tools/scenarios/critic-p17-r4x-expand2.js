/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1400);
  const before = await page.locator('.app__overlay').innerText();
  const e = page.locator('.legend__entry', { hasText: 'Crown colony' }).first();
  await e.scrollIntoViewIfNeeded(); await e.click(); await page.waitForTimeout(800);
  const after = await page.locator('.app__overlay').innerText();
  log('len before/after: ' + before.length + ' / ' + after.length);
  const i = after.indexOf('Crown colony');
  log('AFTER around entry:\n' + after.slice(i-100, i+1200));
  await shot('expanded-crown');
  // details/summary elements
  const d = await page.evaluate(()=>{
    return [...document.querySelectorAll('.app__overlay details, .app__overlay [aria-expanded]')]
      .map(x=>({tag:x.tagName, cls:x.className, exp:x.getAttribute('aria-expanded'), open:x.open, txt:(x.innerText||'').slice(0,60)}));
  });
  log('DISCLOSURES: ' + JSON.stringify(d, null, 0).slice(0,2500));
};
