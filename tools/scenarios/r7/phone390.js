module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  for(let i=0;i<2;i++){ await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();}); await page.waitForTimeout(1400); }
  // open Tools
  const t=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^tools/i.test(x.innerText.trim())&&x.offsetParent); if(b){b.click();return 'opened';}return 'none';});
  log('TOOLS '+t); await page.waitForTimeout(1200); await shot('tools');
  log('TOOLS MENU: '+await page.evaluate(()=>[...document.querySelectorAll('button,a')].filter(x=>x.offsetParent).map(x=>x.innerText.trim().replace(/\s+/g,' ')).filter(Boolean).join(' | ').slice(0,900)));
  const c=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return b.innerText.trim();}return null;});
  log('COUNT IT '+JSON.stringify(c));
  await page.waitForTimeout(1600); await shot('after');
  log('COMMIT: '+await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); if(!b)return 'absent'; const r=b.getBoundingClientRect(); return 'top='+Math.round(r.top)+' vh='+innerHeight+' inview='+(r.top>=0&&r.bottom<=innerHeight);}));
};
