/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1858, 1900, 1947, 1963]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(700);
    const head = await page.evaluate(() => {
      const h = document.querySelector('.tl-year, [class*="tl-yr"], .tl');
      return document.querySelector('.tl')?.innerText.split('\n').slice(0,14).join(' | ');
    });
    const inline = await page.evaluate(() => document.querySelectorAll('.tl-chg:not(.tl-chg--more)').length);
    const moreTxt = await page.evaluate(() => document.querySelector('.tl-chg--more')?.innerText || 'none');
    await page.evaluate(() => document.querySelector('.tl-chg--more')?.click());
    await page.waitForTimeout(600);
    const sheetRows = await page.evaluate(() => {
      const s = document.querySelector('.tl-sheet, [class*="sheet"]');
      if (!s) return {found:false, all:[...document.querySelectorAll('[class*="tl-"]')].map(n=>String(n.className)).filter(c=>/sheet|all/.test(c)).slice(0,10)};
      return { found:true, cls:s.className, rows: s.querySelectorAll('li, .tl-all__row, [class*="row"]').length, txtlen: s.innerText.length, first: s.innerText.slice(0,200) };
    });
    log(y, '| head:', head, '| inline cards:', inline, '| more:', moreTxt, '| sheet:', JSON.stringify(sheetRows));
    await page.evaluate(() => { const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Close'); if(b) b.click(); });
    await page.waitForTimeout(300);
  }
};
