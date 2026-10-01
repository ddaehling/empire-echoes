module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1200);
  for (let i = 0; i < 12; i++) {
    const st = await page.evaluate(() => (window.BEA && window.BEA.toursState) || null);
    if (st && st.done) { log('DONE at step ' + (i+1)); break; }
    // handle checkpoint commit
    const commit = page.locator('button:has-text("Commit")').first();
    if (await commit.count() > 0 && await commit.isVisible().catch(()=>false)) {
      await commit.click();
      await page.waitForTimeout(900);
      const rev = await page.evaluate(() => {
        const p = document.querySelector('.qz-checkpoint, .qz, .tr-panel') || document.body;
        return p.innerText;
      });
      log('=== CHECKPOINT REVEAL (step ' + (i+1) + ') ===');
      log(rev.slice(0, 3500));
      await shot('reveal' + i);
    }
    const next = page.locator('.tr-panel__next').first();
    if (await next.count() === 0) { log('no next'); break; }
    await next.scrollIntoViewIfNeeded().catch(()=>{});
    await next.click({ force: true }).catch(e => log('click err: ' + e.message.split('\n')[0]));
    await page.waitForTimeout(1000);
  }
  const st2 = await page.evaluate(() => (window.BEA && window.BEA.toursState) || null);
  log('state now ' + JSON.stringify(st2));
  // try to finish
  const fin = page.locator('.tr-panel__next').first();
  log('finish visible=' + await fin.isVisible().catch(()=>'err') + ' label=' + await fin.getAttribute('aria-label').catch(()=>'?'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  await shot('after-enter');
  const t = await page.evaluate(() => document.body.innerText);
  log('=== AFTER FINISH ===');
  log(t.slice(0, 9000));
};
