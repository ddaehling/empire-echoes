/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const FIX = () => { const s=document.createElement('style'); s.textContent='.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.35 !important}'; document.head.append(s); };
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.evaluate(FIX);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(700);
  for (const k of ['1','3']) {
    await page.click('.map__plate', { position: { x: 400, y: 300 } }).catch(()=>{});
    await page.keyboard.press(k);
    await page.waitForTimeout(900);
    const panel = await page.evaluate(() => {
      const n = document.querySelector('.stage__over') || document.body;
      return n.innerText.replace(/\n+/g, ' | ').slice(0, 700);
    });
    const tl = await page.evaluate(() => document.querySelector('.tl__count').innerText);
    log('key ' + k + ' -> TIMELINE: ' + tl);
    log('   map panel: ' + panel);
    await shot('key-' + k);
  }
};
