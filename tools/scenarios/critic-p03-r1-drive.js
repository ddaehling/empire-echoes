/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Neutralise the P04 dossier empty-state overflow so the shell grid is sane,
// then drive P03 properly.
const FIX = () => {
  const s = document.createElement('style');
  s.textContent = '.dossier--empty{max-height:100%;overflow:auto}.dsr__prose,.dsr__name{font-size:1rem !important;line-height:1.4 !important}';
  document.head.append(s);
};

module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(FIX);
  await page.waitForTimeout(600);
  const box = await page.evaluate(() => { const b = document.querySelector('.tl').getBoundingClientRect(); return {top:Math.round(b.top),h:Math.round(b.height)}; });
  log('after fix, tl box:', JSON.stringify(box), 'docH', await page.evaluate(()=>document.documentElement.scrollHeight));
  await shot('fixed-viewport');
  await shot('tl-default-1900', '.tl');

  // scrub to 1820 via URL
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(900);
  log('1820 tl text >>>', await page.evaluate(() => document.querySelector('.tl').innerText));
  await shot('tl-1820', '.tl');

  // 1610
  await page.evaluate(() => { location.hash = '#year=1610'; });
  await page.waitForTimeout(700);
  log('1610 tl text >>>', await page.evaluate(() => document.querySelector('.tl').innerText));
  await shot('tl-1610', '.tl');

  // 2020 (post 1997)
  await page.evaluate(() => { location.hash = '#year=2020'; });
  await page.waitForTimeout(700);
  log('2020 tl text >>>', await page.evaluate(() => document.querySelector('.tl').innerText));
  await shot('tl-2020', '.tl');

  // 1600 (pre-spine? no, atlantic starts 1585)
  await page.evaluate(() => { location.hash = '#year=1570'; });
  await page.waitForTimeout(700);
  log('1570 tl text >>>', await page.evaluate(() => document.querySelector('.tl').innerText));
  await shot('tl-1570', '.tl');
};
