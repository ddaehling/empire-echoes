module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Teaching desk")').first().click();
  await page.waitForTimeout(1400);
  for (const tab of ['Classroom','Evidence','Methods']) {
    const el = page.locator('button:has-text("' + tab + '"), [role=tab]:has-text("' + tab + '")').first();
    if (await el.count() === 0) { log('no tab ' + tab); continue; }
    await el.click({force:true});
    await page.waitForTimeout(1400);
    await shot('tab-' + tab);
    const t = await page.evaluate(() => {
      const d = document.querySelector('.tk, .desk, [class*="desk"], [class*="teacher"]') || document.body;
      return d.innerText;
    });
    log('=== TAB ' + tab + ' ===\n' + t.slice(0, 14000));
  }
};
