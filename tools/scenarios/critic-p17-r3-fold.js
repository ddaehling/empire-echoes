/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.innerText: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const t = page.locator('.legend__toggle').first();
  log('toggle: ' + await t.innerText() + ' aria=' + await t.getAttribute('aria-expanded'));
  await t.click(); await page.waitForTimeout(700);
  await shot('folded');
  const g = await page.evaluate(() => { const e=document.querySelector('.legend'); const b=e.getBoundingClientRect(); return { h:Math.round(b.h||b.height), y:Math.round(b.y), txt: e.innerText.replace(/\n+/g,' | ').slice(0,300) }; });
  log('FOLDED: ' + JSON.stringify(g));
  // reload to see if fold persists
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(2500);
  const g2 = await page.evaluate(() => { const e=document.querySelector('.legend'); return e ? e.innerText.slice(0,80).replace(/\n/g,' | ') : null; });
  log('AFTER RELOAD: ' + g2);
  await shot('after-reload');
  // hammer state
  for (const k of ['1','2','3','4','p','w','s','h','p','w','s','h','2','4']) { await page.keyboard.press(k); await page.waitForTimeout(180); }
  await page.waitForTimeout(1500);
  await shot('hammered');
  const g3 = await page.evaluate(() => { const e=document.querySelector('.legend'); const b=document.querySelector('.byline'); return { legend: e? e.innerText.split('MARKS')[0].replace(/\n+/g,' | ') : null, byline: b? b.innerText.replace(/\n+/g,' | ').slice(0,600):null }; });
  log('AFTER HAMMER: ' + JSON.stringify(g3, null, 1));
};
