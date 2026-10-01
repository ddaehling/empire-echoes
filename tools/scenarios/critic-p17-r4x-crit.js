/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const readCrit = (page) => page.evaluate(() => {
  const leg = document.querySelector('.legend');
  if (!leg) return '(no legend)';
  const t = leg.innerText;
  const i = t.indexOf('THREE THINGS WRONG');
  if (i < 0) return '(no three-things block) ::: ' + t.slice(0,300);
  const j = t.indexOf('MARKS THAT ARE NOT COLOURS');
  return t.slice(i, j > i ? j : i + 1800);
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const open = async () => {
    const b = page.locator('button', { hasText: 'Open the full key' });
    if (await b.count()) { await b.first().click(); await page.waitForTimeout(900); }
  };
  await open();
  log('=== MERCATOR / claimed ===\n' + await readCrit(page));
  for (const [name, key] of [['equal-earth','p'],['weight','w'],['stitching','s'],['controlled','3'],['influenced','4'],['year-1750','']]) {
    if (key) { await page.keyboard.press(key); }
    else { await page.evaluate(()=>{ location.hash = '#year=1750'; }); }
    await page.waitForTimeout(1400);
    log('=== ' + name + ' ===\n' + await readCrit(page));
  }
  await shot('crit-final');
};
