module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(900);
  const adv = async () => { await page.evaluate(() => { const bs=Array.from(document.querySelectorAll('button')).filter(b=>/next beat|finish the lesson/i.test(b.getAttribute('aria-label')||'')); const b=bs.find(x=>x.offsetParent!==null)||bs[0]; if(b) b.click(); }); await page.waitForTimeout(900); };
  for (let i=0;i<4;i++) await adv();
  const sl = page.locator('input[type=range]').first();
  await sl.focus();
  for (let i=0;i<10;i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b=Array.from(document.querySelectorAll('button')).find(x=>/^commit$/i.test(x.textContent.trim()) && x.offsetParent!==null && !x.disabled); if(b) b.click(); });
  await page.waitForTimeout(1400);
  await shot('cp1-reveal');
  const el = await page.evaluate(()=> { const n=document.querySelector('[class*="cp"],[class*="check"]'); return null; });
  log('=== REVEAL PANEL ===\n' + (await page.evaluate(()=>{
    const cands = Array.from(document.querySelectorAll('aside,section,div')).filter(d=>/Middle Passage|came off them alive|Trans-Atlantic/i.test(d.innerText||''));
    const smallest = cands.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return smallest ? smallest.innerText : 'not found';
  })).slice(0,4000));
};
