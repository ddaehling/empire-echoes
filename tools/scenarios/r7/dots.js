module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('http://localhost:8777/app/#tour=core&step=7',{waitUntil:'load'});
  await page.waitForTimeout(3600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b)b.click();});
  await page.waitForTimeout(1500);
  // pick a dot ~ 60
  await page.evaluate(()=>{const dots=[...document.querySelectorAll('.viz-dots button, .viz-dots [role=button], .viz-dots__d')]; if(dots[59])dots[59].click();});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1600);
  await shot('reveal');
  log('REVEAL: '+await page.evaluate(()=>{const v=document.querySelector('.viz')||document.querySelector('.tr-panel'); return v?v.innerText.replace(/\s+/g,' ').slice(0,2200):'none';}));
  log('ERR '+JSON.stringify(errs));
};
