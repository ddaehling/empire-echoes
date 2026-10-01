module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  await page.evaluate(()=>document.querySelector('.tr-panel__next').click()); await page.waitForTimeout(1200);
  await page.evaluate(()=>document.querySelector('.tr-panel__next').click()); await page.waitForTimeout(2200);
  log('HASH '+await page.evaluate(()=>location.hash));
  log('AUX '+await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/count it/i.test(x.innerText)).map(x=>x.innerText.trim()+'|vis='+!!x.offsetParent).join(', ')));
  // scroll the beat panel to the bottom to find the in-beat flow
  await page.evaluate(()=>{const s=document.querySelector('.tr-panel__scroll'); if(s)s.scrollTop=s.scrollHeight;});
  await page.waitForTimeout(900);
  await shot('beat3-bottom');
  log('PANEL FULL: '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' '):'none';}));
  const a=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return 'clicked';}return 'none';});
  log('CLICK '+a);
  await page.waitForTimeout(1800);
  await shot('flow');
  log('FLOW: '+await page.evaluate(()=>{const f=document.querySelector('.viz-flow')||document.querySelector('[class*=flow]')||document.querySelector('.viz'); return f?f.innerText.replace(/\s+/g,' ').slice(0,2600):'none';}));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(2000);
  await shot('flowrev');
  log('REVEAL: '+await page.evaluate(()=>{const f=document.querySelector('.viz'); return f?f.innerText.replace(/\s+/g,' ').slice(0,3000):'none';}));
};
