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
  for (const s of ['Mercator — and the sheet never says so','One flat red for everything British','1886 in the title']) {
    await page.locator('text=' + s).first().click(); await page.waitForTimeout(400);
  }
  await page.locator('.app__overlay textarea').first().fill('The border argues the empire is natural and glorious.');
  await page.locator('.app__overlay button', { hasText: 'Keep these answers' }).first().click();
  await page.waitForTimeout(1000);
  await shot('kept-shot');
  const led = await page.evaluate(()=>{ try { const B=window.BEA; return { keys: Object.keys(B), ledger: B.ledger? (B.ledger.all? B.ledger.all().length : 'has ledger') : 'none',
    dump: B.ledger && B.ledger.all ? JSON.stringify(B.ledger.all()).slice(0,900) : null }; } catch(e){ return String(e); } });
  log('BEA: ' + JSON.stringify(led));
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
  await shot('close');
  const t = await page.evaluate(()=>document.body.innerText);
  log('HAS 1886 in Close? ' + t.includes('1886'));
  const i = t.indexOf('1886'); log(i>=0? t.slice(Math.max(0,i-500), i+700) : '(no 1886)');
};
