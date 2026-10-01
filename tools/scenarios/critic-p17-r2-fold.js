/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const state = () => page.evaluate(() => {
    const b = document.querySelector('.legend__foldbtn, .legend__titlerow button');
    return { btnText: b?b.innerText:'NOBTN', aria: b?b.getAttribute('aria-expanded'):null, legend: document.querySelector('.stage__legend').innerText.replace(/\n+/g,' | ').slice(0,160) };
  });
  log('BEFORE', JSON.stringify(await state()));
  await page.evaluate(()=>document.querySelector('.legend__foldbtn, .legend__titlerow button').click());
  await page.waitForTimeout(600);
  log('AFTER 1st', JSON.stringify(await state()));
  await page.evaluate(()=>document.querySelector('.legend__foldbtn, .legend__titlerow button').click());
  await page.waitForTimeout(600);
  log('AFTER 2nd', JSON.stringify(await state()));
  await shot('after-2nd');
};
