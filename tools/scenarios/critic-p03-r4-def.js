/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(900);
  await page.evaluate(()=>document.body.click());
  for (const k of ['4','2','3','1']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => {
      const d = document.querySelector('[class*="tl-def"], .tl__def');
      return { hash: location.hash, def: d ? d.innerText.replace(/\n/g,' | ').slice(0,700) : 'none', head: document.querySelector('.tl__year, .tl-head')?.innerText };
    });
    log('key ' + k + ': ' + JSON.stringify(t));
    await shot('def' + k);
  }
  // Alt+arrow
  await page.evaluate(()=>document.querySelector('.tl-ax__rail').focus());
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(700);
  log('after Alt+Right:', await page.evaluate(()=>location.hash));
  await shot('altright');
};
