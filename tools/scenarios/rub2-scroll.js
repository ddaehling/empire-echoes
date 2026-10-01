/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.evaluate: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const s = process.env.S || '17';
  await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
  await page.waitForTimeout(2200);
  const sel = '.tr-panel';
  const p = page.locator(sel).first();
  await shot('a');
  for (let i=0;i<4;i++){
    await p.evaluate(el=>el.scrollBy(0, el.clientHeight*0.9));
    await page.waitForTimeout(500);
    await shot('scroll'+i);
  }
  log(await p.evaluate(el=>el.innerText));
};
