/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const st = () => { const leg=document.querySelector('.stage__legend'); const lr=leg.getBoundingClientRect();
  const t=leg.querySelector('.legend__toggle');
  return {h:Math.round(lr.height), toggle: t?t.innerText.trim():null, expanded: t?t.getAttribute('aria-expanded'):null,
    colours:/COLOURS/.test(leg.innerText), txt: leg.innerText.replace(/\s+/g,' ').slice(0,180)}; };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  log('base ' + JSON.stringify(await page.evaluate(st)));
  for (let i=0;i<4;i++) {
    await page.click('.legend__toggle'); await page.waitForTimeout(700);
    log('click'+(i+1)+' ' + JSON.stringify(await page.evaluate(st)));
  }
  await shot('fold-cycle');
};
