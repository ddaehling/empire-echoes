module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson"), a:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1200);
  const dumpBtns = async (tag) => {
    const b = await page.evaluate(() => [...document.querySelectorAll('button,a[role=button]')]
      .filter(e => e.offsetParent !== null)
      .map(e => (e.tagName + '|' + (e.className||'').toString().slice(0,50) + '|' + (e.innerText||'').replace(/\s+/g,' ').slice(0,60))));
    log(tag + ' BUTTONS(' + b.length + '):\n' + b.join('\n'));
  };
  for (let i = 1; i <= 30; i++) {
    const hdr = await page.evaluate(() => {
      const s = document.querySelector('[class*="step"],[class*="transport"]');
      return document.body.innerText.slice(0, 400);
    });
    const nxt = page.locator('button:has-text("Next")').first();
    const n = await nxt.count();
    log('--- at ' + i + ' nextCount=' + n);
    if (!n) { await dumpBtns('STUCK@'+i); await shot('stuck-'+i); break; }
    const dis = await nxt.isDisabled().catch(()=>false);
    if (dis) { await dumpBtns('DISABLED@'+i); await shot('gate-'+i); break; }
    await nxt.click();
    await page.waitForTimeout(700);
  }
};
