/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => { location.hash = '#year=1913&sel=bengal-presidency'; });
  await page.waitForTimeout(1200);
  const probe = async (label) => log(label + ' ' + JSON.stringify(await page.evaluate(() => ({
    docTop: document.scrollingElement.scrollTop,
    dossTop: document.querySelector('.app__dossier').scrollTop,
    dossSH: document.querySelector('.app__dossier').scrollHeight,
    dossCH: document.querySelector('.app__dossier').clientHeight,
    timeTop: (document.querySelector('.app__time')||{getBoundingClientRect:()=>({top:null})}).getBoundingClientRect().top,
  }))));
  await probe('initial');
  // wheel over dossier
  await page.mouse.move(1150, 600); await page.mouse.wheel(0, 2000); await page.waitForTimeout(400);
  await probe('after wheel over dossier');
  // wheel over top bar
  await page.mouse.move(400, 20); await page.mouse.wheel(0, 2000); await page.waitForTimeout(400);
  await probe('after wheel over bar');
  // keyboard
  await page.keyboard.press('End'); await page.waitForTimeout(400);
  await probe('after End');
  // force scroll the window
  await page.evaluate(() => document.scrollingElement.scrollTo(0, 3000)); await page.waitForTimeout(400);
  await probe('after programmatic window scroll');
  await shot('forced-3000');
  // does a below-fold element exist and is it in view?
  const v = await page.evaluate(() => {
    const n = document.querySelector('[data-block=evidence], [data-block=misconception], .dsr__actors');
    return n ? { cls: n.className, top: Math.round(n.getBoundingClientRect().top) } : 'none';
  });
  log('below-fold element position: ' + JSON.stringify(v));
};
