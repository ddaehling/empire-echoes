/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // enumerate the colour key rows
  const rows = await page.evaluate(() => [...document.querySelectorAll('.legend__section--key .legend__row, .legend__rows li')].map(li => (li.innerText||'').replace(/\n/g,' | ').slice(0,160)));
  log('KEY ROWS (' + rows.length + '):\n' + rows.join('\n'));
  // open the first status row
  const btn = page.locator('.legend__section--key button, .legend__rows button').first();
  log('row buttons: ' + await page.locator('.legend__section--key button').count());
  await btn.click();
  await page.waitForTimeout(900);
  await shot('row-open');
  const t = await page.evaluate(() => {
    const open = document.querySelector('.legend__row[aria-expanded="true"], .legend [aria-expanded="true"]');
    const w = document.querySelector('.legend__bodywrap');
    return { open: open ? open.parentElement.innerText.slice(0,1200) : null, st: w && w.scrollTop, ch: w && w.clientHeight, sh: w && w.scrollHeight };
  });
  log('OPEN ROW: ' + JSON.stringify(t, null, 1));
  await shot('row-open-legend', '.legend');
};
