/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const grab = async (page) => page.evaluate(() => {
  const by = document.querySelector('.byline');
  const leg = document.querySelector('.legend');
  return { byline: by && by.innerText, legend: leg && leg.innerText, hash: location.hash };
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const seq = [
    ['start', null],
    ['def2-administered', '2'],
    ['def3-controlled', '3'],
    ['def4-influenced', '4'],
    ['def1-claimed', '1'],
    ['proj-P', 'p'],
    ['weight-W', 'w'],
    ['stitch-S', 's'],
    ['silence-H', 'h'],
  ];
  for (const [name, key] of seq) {
    if (key) { await page.keyboard.press(key); await page.waitForTimeout(1400); }
    const g = await grab(page);
    log('===== ' + name + ' hash=' + g.hash);
    log('BYLINE: ' + (g.byline||'(none)').replace(/\n/g,' | '));
    log('LEGEND: ' + (g.legend||'(none)').replace(/\n/g,' | '));
  }
  await shot('after-all');
};
