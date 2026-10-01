module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(900);
  await page.locator('button:has-text("Tools")').first().click();
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Teaching desk"), a:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1400);
  await shot('01-desk');
  const t = await page.evaluate(() => document.body.innerText);
  log('DESK>>>\n' + t + '\n<<<');
  /* any minute figure printed */
  const mins = (t.match(/[^.]{0,110}\b\d+\s*(?:–|-|to)?\s*\d*\s*minutes?\b[^.]{0,60}/gi) || []);
  log('MINUTE SENTENCES:\n' + mins.join('\n---\n'));
};
