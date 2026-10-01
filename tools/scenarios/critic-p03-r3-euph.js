/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1788, 1840, 1655, 1913, 1952, 1919, 1943]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector('.tl-chg--more')?.click());
    await page.waitForTimeout(500);
    const txt = await page.evaluate(()=>{const e=document.querySelector('.tl-all'); return e?e.innerText.replace(/\n+/g,' | ').slice(0,2000):(document.querySelector('.tl')?.innerText.replace(/\n+/g,' | ').slice(0,1400));});
    log('=== '+y+' ===', txt);
    await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Close'); if(b) b.click(); });
    await page.waitForTimeout(200);
  }
};
