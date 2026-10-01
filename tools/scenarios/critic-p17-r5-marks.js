/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1957', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  await page.keyboard.press('h'); await page.waitForTimeout(1600);
  const b = page.locator('button', { hasText: /Open the full key/i }).first();
  if (await b.count()) await b.click(); await page.waitForTimeout(1400);
  const marks = await page.evaluate(() => {
    const s = document.querySelector('#plate-more-h');
    let box = s ? (s.closest('section')||s.parentElement) : null;
    if (!box) { box = [...document.querySelectorAll('section')].find(x=>/MARKS THAT ARE NOT COLOURS/i.test(x.innerText||'')); }
    return box ? box.innerText.slice(0,3000) : 'NOT FOUND';
  });
  log('MARKS SECTION:\n' + marks);
  await shot('marks');
  // full plate text
  const all = await page.evaluate(()=> (document.querySelector('[class*="lplate"]')||document.body).innerText.slice(0,6000));
  log('PLATE:\n'+all);
};
