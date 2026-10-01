module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1000);
  const nexts = await page.evaluate(() => Array.from(document.querySelectorAll('button')).filter(b=>/next|finish/i.test((b.getAttribute('aria-label')||'')+(b.title||''))).map(b=>({cls:b.className, al:b.getAttribute('aria-label'), t:b.title, vis:b.offsetParent!==null})));
  log('NEXT BUTTONS: ' + JSON.stringify(nexts));
  for (let i = 0; i < 11; i++) {
    const st = await page.evaluate(() => (window.BEA && window.BEA.toursState) || null);
    if (st && st.done) { log('DONE, advances=' + i); break; }
    const commit = page.locator('button:has-text("Commit")').first();
    if (await commit.count() > 0 && await commit.isVisible().catch(()=>false)) {
      await commit.click({timeout:3000}).catch(()=>{});
      await page.waitForTimeout(800);
      const rev = await page.evaluate(() => (document.querySelector('.tr-panel')||document.body).innerText);
      log('=== REVEAL after commit (advance ' + i + ') ===\n' + rev.slice(0, 3000));
    }
    const ok = await page.evaluate(() => {
      const bs = Array.from(document.querySelectorAll('button')).filter(b=>/next|finish/i.test((b.getAttribute('aria-label')||'')));
      const b = bs.find(x=>x.offsetParent!==null) || bs[0];
      if (!b) return 'none';
      b.click(); return b.getAttribute('aria-label');
    });
    log('advance ' + i + ' via ' + ok);
    await page.waitForTimeout(900);
  }
  await shot('final-step');
  const t = await page.evaluate(() => document.body.innerText);
  log('=== BODY ===\n' + t.slice(0, 14000));
};
