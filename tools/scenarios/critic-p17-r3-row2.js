/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const btns = page.locator('.legend__entry');
  const n = await btns.count();
  for (const i of [0, 3, 9, 14]) {
    await btns.nth(i).click();
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => {
      const open = document.querySelector('.legend__entry[aria-expanded="true"]');
      if (!open) return 'none open';
      let p = open.closest('li') || open.parentElement;
      return p.innerText;
    });
    log('=== ROW ' + i + ' ===\n' + t + '\n');
    await btns.nth(i).click(); await page.waitForTimeout(300);
  }
  // the informal one
  await page.locator('.legend__entry', { hasText: 'Informal empire' }).first().click();
  await page.waitForTimeout(800);
  await shot('informal-open');
  const t2 = await page.evaluate(() => { const o=document.querySelector('.legend__entry[aria-expanded="true"]'); return o ? (o.closest('li')||o.parentElement).innerText : 'none'; });
  log('INFORMAL ROW:\n' + t2);
};
