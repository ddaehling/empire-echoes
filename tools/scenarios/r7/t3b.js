module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=2',{waitUntil:'load'});
  await page.waitForTimeout(2800);
  await page.goto('http://localhost:8777/app/#tour=core&step=3',{waitUntil:'load'});
  await page.waitForTimeout(4200);
  const aux=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return b.innerText.trim();}return null;});
  log('AUX '+JSON.stringify(aux));
  await page.waitForTimeout(1800);
  await shot('flow');
  log('FLOW: '+await page.evaluate(()=>{const f=document.querySelector('[class*=viz-flow], .viz'); return f?f.innerText.replace(/\s+/g,' ').slice(0,2600):'none';}));
};
