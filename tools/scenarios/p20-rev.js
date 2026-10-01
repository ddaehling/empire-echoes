/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });
  await page.waitForTimeout(900);
  await page.goto(page.url().split('#')[0] + '#panel=workshop');
  await page.waitForTimeout(1600);
  // write an answer and place two cards, then print the revision sheet
  await page.click('#tp-write-utility');
  await page.type('#tp-write-utility', 'Plaatje wrote Native Life in South Africa in London in 1916 as a campaign document, to get the Natives Land Act repealed and to raise money for the deputation, so its purpose is what makes it useful rather than what discredits it. It cannot tell us how many families were evicted.', { delay: 0 });
  await page.evaluate(() => {
    document.querySelectorAll('.tp-case').forEach((c, i) => { if (i < 3) c.querySelectorAll('.tp-vote')[i % 3].click(); });
  });
  await page.waitForTimeout(400);
  await page.click('#tp-tab-classroom');
  await page.waitForTimeout(600);
  const ok = await page.evaluate(() => {
    const li = [...document.querySelectorAll('.tp-packs__i')].find(x => x.textContent.includes('The revision sheet'));
    if (!li) return false; li.querySelector('button').click(); return true;
  });
  log('revision pack: ' + ok);
  await page.waitForTimeout(500);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);
  await shot('revision');
  await page.emulateMedia({ media: 'screen' });
  log('printed: ' + await page.evaluate(() => window.__printed));
};
