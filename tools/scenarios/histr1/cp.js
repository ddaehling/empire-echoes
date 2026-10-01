module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);
  const adv = async () => { await page.evaluate(() => { const bs=Array.from(document.querySelectorAll('button')).filter(b=>/next beat|finish the lesson/i.test(b.getAttribute('aria-label')||'')); const b=bs.find(x=>x.offsetParent!==null)||bs[0]; if(b) b.click(); }); await page.waitForTimeout(900); };
  for (let i=0;i<4;i++) await adv();      // to step 5 = recall t3
  await shot('cp1-question');
  log('=== CP1 PANEL ===\n' + (await page.evaluate(()=> (document.querySelector('.qz-cp, .qz-check, .tr-panel, .cx-sheet')||document.body).innerText)).slice(0,2500));
  // commit whatever the slider shows
  await page.evaluate(() => { const b=Array.from(document.querySelectorAll('button')).find(x=>/^commit$/i.test(x.textContent.trim()) && x.offsetParent!==null); if(b) b.click(); });
  await page.waitForTimeout(1200);
  await shot('cp1-reveal');
  log('=== CP1 REVEAL ===\n' + (await page.evaluate(()=> document.body.innerText)).slice(0,6000));
};
