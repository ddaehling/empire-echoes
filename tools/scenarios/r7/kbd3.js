module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  // keyboard-only start
  for(let i=0;i<10;i++){ await page.keyboard.press('Tab');
    if(await page.evaluate(()=>/cx-cta/.test(String(document.activeElement.className)))) break; }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  const seen=[];
  for(let i=0;i<12;i++){
    await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
    const f=await page.evaluate(()=>{const a=document.activeElement; return a===document.body?'BODY':a.tagName+'.'+String(a.className).slice(0,32)+' "'+(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)+'"';});
    seen.push(i+': '+f);
    if(/tr-bar__next/.test(f)){log('NEXT via Shift+Tab at '+i);break;}
  }
  log(seen.join('\n'));
  // does Enter on Next advance?
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  log('HASH '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  await shot('kbd3');
};
