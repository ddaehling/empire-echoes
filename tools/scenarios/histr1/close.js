module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);
  for (let i=0;i<10;i++) { await page.evaluate(() => { const bs=Array.from(document.querySelectorAll('button')).filter(b=>/next beat|finish the lesson/i.test(b.getAttribute('aria-label')||'')); const b=bs.find(x=>x.offsetParent!==null)||bs[0]; if(b) b.click(); }); await page.waitForTimeout(700); }
  await page.waitForTimeout(2000);
  await shot('close');
  log('=== CLOSE ===\n' + (await page.evaluate(()=>document.body.innerText)).slice(0,14000));
};
