/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1300);
  await page.locator('text=Mercator — and the sheet never says so').first().click();
  await page.waitForTimeout(500);
  await page.locator('text=One flat red for everything British').first().click();
  await page.waitForTimeout(500);
  await page.locator('text=1886 in the title').first().click();
  await page.waitForTimeout(500);
  const ta = page.locator('.app__overlay textarea').first();
  await ta.fill('The border is arguing that the empire is natural and glorious.');
  await page.waitForTimeout(400);
  const keep = page.locator('.app__overlay button', { hasText: 'Keep these answers' }).first();
  log('keep count: ' + await page.locator('.app__overlay button', { hasText: 'Keep these answers' }).count());
  await keep.click();
  await page.waitForTimeout(1200);
  await shot('kept');
  const t = await page.locator('.app__overlay').innerText();
  const i = t.indexOf('NOW DO IT');
  log('AFTER KEEP:\n' + t.slice(i, i+1200));
  const ls = await page.evaluate(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); o[k]=(localStorage.getItem(k)||'').slice(0,200);} return o; });
  log('LOCALSTORAGE: ' + JSON.stringify(ls).slice(0,1500));
  // reload and check persistence
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2800);
  await page.locator('button', { hasText: /Open the full key|Three things wrong/ }).first().click();
  await page.waitForTimeout(1400);
  const t2 = await page.locator('.app__overlay').innerText();
  const j = t2.indexOf('NOW DO IT');
  log('AFTER RELOAD:\n' + (j>=0? t2.slice(j, j+900):'(no poster block)'));
};
