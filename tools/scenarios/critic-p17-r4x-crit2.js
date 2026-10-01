/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const readCrit = (page) => page.evaluate(() => {
  const all = [...document.querySelectorAll('*')].filter(e => e.children.length===0 || true);
  const host = [...document.querySelectorAll('div,section,aside')].find(e => e.innerText && e.innerText.includes('THREE THINGS WRONG WITH THIS RENDERING') && e.innerText.length < 9000);
  if (!host) return '(none)';
  const t = host.innerText;
  const i = t.indexOf('THREE THINGS WRONG');
  const j = t.indexOf('MARKS THAT ARE NOT COLOURS');
  return (host.className||host.tagName) + ' >>> ' + t.slice(i, j>i?j:i+1600);
});
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const b = page.locator('button', { hasText: 'Open the full key' });
  await b.first().click(); await page.waitForTimeout(1200);
  log('=== MERCATOR / claimed / 1900 ===\n' + await readCrit(page));
  for (const [name, key] of [['equal-earth','p'],['weight','w'],['stitching','s'],['controlled','3'],['influenced','4']]) {
    await page.keyboard.press(key); await page.waitForTimeout(1500);
    log('=== ' + name + ' ===\n' + await readCrit(page));
  }
  await page.evaluate(()=>{ location.hash='#year=1750'; }); await page.waitForTimeout(1600);
  log('=== year 1750 ===\n' + await readCrit(page));
  await shot('crit');
};
