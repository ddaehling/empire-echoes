/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1200);
  const panel = page.locator('.app__overlay');
  const txt = await panel.innerText();
  log('PANEL LEN', String(txt.length));
  log('HAS 1886?', String(txt.includes('1886')));
  const idx = txt.indexOf('1886');
  log('AROUND 1886:\n' + txt.slice(Math.max(0,idx-400), idx+2600));
  // scroll to bottom of panel
  await page.evaluate(() => { const p = document.querySelector('.app__overlay'); const sc = p.querySelector('[class*="scroll"]')||p; sc.scrollTop = 99999; const all=[...p.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20); all.forEach(e=>e.scrollTop=99999); });
  await page.waitForTimeout(600);
  await shot('key-bottom');
  const t2 = await panel.innerText();
  log('TAIL:\n' + t2.slice(-3000));
};
