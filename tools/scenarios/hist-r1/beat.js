module.exports = async ({ page, shot, log }) => {
  const target = +(process.env.BEAT || 17);
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1000);
  for (let i = 1; i < target; i++) {
    let nxt = page.locator('button:has-text("Next")').first();
    if (await nxt.count() === 0) {
      const cell = page.locator('.tr-field__cell').nth(4);
      if (await cell.count()) { await cell.click().catch(()=>{}); await page.waitForTimeout(500); }
      nxt = page.locator('button:has-text("Next")').first();
    }
    if (await nxt.count() === 0) { log('stuck before ' + target + ' at ' + i); break; }
    await nxt.click(); await page.waitForTimeout(600);
  }
  // close dossier if open
  const cl = page.locator('.dsr__close').first();
  if (await cl.count()) { await cl.click().catch(()=>{}); await page.waitForTimeout(500); }
  await page.waitForTimeout(600);
  await shot('beat-' + target);
  const t = await page.evaluate(() => document.body.innerText);
  log('FULL BODY:\n' + t.replace(/Arrow keys move between[\s\S]*?puts it back\./,'[kbd]'));
};
