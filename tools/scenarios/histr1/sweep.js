module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await shot('a-door');
  await page.locator('button:has-text("Start the lesson")').first().click().catch(async()=>{ await page.evaluate(()=>{const b=Array.from(document.querySelectorAll('button')).find(x=>/start the lesson/i.test(x.textContent)); if(b)b.click();}); });
  await page.waitForTimeout(1500);
  await shot('b-beat1');
  for (let i=0;i<5;i++){ await page.evaluate(() => { const bs=Array.from(document.querySelectorAll('button')).filter(b=>/next beat|finish the lesson/i.test(b.getAttribute('aria-label')||'')); const b=bs.find(x=>x.offsetParent!==null)||bs[0]; if(b) b.click(); }); await page.waitForTimeout(700); }
  await shot('c-beat6');
  const overflow = await page.evaluate(()=>({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight }));
  log('overflow ' + JSON.stringify(overflow));
  // keyboard only
  for (let i=0;i<25;i++) await page.keyboard.press('Tab');
  const f = await page.evaluate(()=>{const a=document.activeElement; return a? a.tagName+'.'+a.className+' | '+(a.getAttribute('aria-label')||a.textContent||'').slice(0,60):'none';});
  log('focus after 25 tabs: ' + f);
  await shot('d-kbd');
};
