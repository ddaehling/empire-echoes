module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // start the default lesson
  const btn = page.locator('button:has-text("Start the lesson")').first();
  await btn.click();
  await page.waitForTimeout(1500);
  for (let i = 0; i < 16; i++) {
    const st = await page.evaluate(() => (window.BEA && window.BEA.toursState) || null);
    log('==================== STEP ' + (i+1) + ' state=' + JSON.stringify(st));
    const t = await page.evaluate(() => {
      const p = document.querySelector('.tr-panel') || document.querySelector('.cx-sheet') || document.body;
      return p.innerText;
    });
    log(t.slice(0, 4000));
    await shot('step' + String(i+1).padStart(2,'0'));
    // find next
    const next = page.locator('button:has-text("Next"), .tr-panel__next, button[data-act="next"]').first();
    if (await next.count() === 0) { log('NO NEXT BUTTON'); break; }
    const dis = await next.isDisabled().catch(()=>false);
    if (dis) { log('NEXT DISABLED — gated'); }
    await next.click({ force: true }).catch(e => log('click err ' + e.message));
    await page.waitForTimeout(1200);
  }
};
