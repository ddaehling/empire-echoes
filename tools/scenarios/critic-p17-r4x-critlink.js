/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const before = await page.evaluate(()=>document.body.innerText.length);
  await page.locator('.byline__crit').first().click();
  await page.waitForTimeout(1400);
  await shot('after-crit');
  const o = await page.evaluate(()=>{
    const ov=document.querySelector('.app__overlay');
    const t = ov? ov.innerText : '';
    const i = t.indexOf('THREE THINGS');
    return { hasCrit: i>=0, len: t.length, snippet: i>=0? t.slice(i, i+800) : t.slice(0,300),
      focus: document.activeElement && (document.activeElement.className||document.activeElement.tagName) };
  });
  log(JSON.stringify(o, null, 1));
};
