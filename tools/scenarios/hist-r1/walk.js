module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1200);
  const t0 = Date.now();
  for (let i = 1; i <= 40; i++) {
    const txt = await page.evaluate(() => document.body.innerText);
    log('\n@@@@@@@@ SCREEN ' + i + ' (t=' + Math.round((Date.now()-t0)/1000) + 's) @@@@@@@@\n' + txt.replace(/Arrow keys move between[\s\S]*?puts it back\./,'[kbd help]').slice(0, 2600));
    let nxt = page.locator('button:has-text("Next")').first();
    if (await nxt.count() === 0) {
      // gate: try field cell, then choice buttons, then decline
      const cell = page.locator('.tr-field__cell').nth(4);
      if (await cell.count()) { await cell.click().catch(()=>{}); await page.waitForTimeout(600); }
      let ch = page.locator('.hgx-choice, [class*="gate"] button').first();
      nxt = page.locator('button:has-text("Next")').first();
      if (await nxt.count() === 0) {
        const dec = page.locator('button:has-text("I would rather not")').first();
        if (await dec.count()) { await dec.click().catch(()=>{}); await page.waitForTimeout(600); }
      }
      nxt = page.locator('button:has-text("Next")').first();
      if (await nxt.count() === 0) { await shot('blocked-'+i); log('BLOCKED at '+i); break; }
    }
    await nxt.click().catch(async e => { log('clickfail '+i); });
    await page.waitForTimeout(800);
  }
  await shot('final');
};
