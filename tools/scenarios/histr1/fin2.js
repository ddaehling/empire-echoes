module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1000);
  for (let i = 0; i < 11; i++) {
    const st = await page.evaluate(() => (window.BEA && window.BEA.toursState) || null);
    if (st && st.done) { log('DONE after ' + i + ' advances'); break; }
    const commit = page.locator('button:has-text("Commit")').first();
    if (await commit.count() > 0 && await commit.isVisible().catch(()=>false)) {
      await commit.click({timeout:3000}).catch(()=>{});
      await page.waitForTimeout(700);
      const rev = await page.evaluate(() => (document.querySelector('.tr-panel')||document.body).innerText);
      log('=== REVEAL ' + i + ' ===\n' + rev.slice(0, 2500));
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);
  await shot('close');
  const t = await page.evaluate(() => document.body.innerText);
  log('=== BODY AFTER FINISH ===\n' + t.slice(0, 12000));
};
