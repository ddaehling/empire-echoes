module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=13',{waitUntil:'load'});
  await page.waitForTimeout(2800);
  await page.goto('http://localhost:8777/app/#tour=core&step=14',{waitUntil:'load'});
  await page.waitForTimeout(4200);
  log('AUX '+await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/count it/i.test(x.innerText)).map(x=>x.innerText.trim()+'|'+!!x.offsetParent).join(', ')));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('twin');
  log('TWIN: '+await page.evaluate(()=>{const f=document.querySelector('.viz'); return f?f.innerText.replace(/\s+/g,' ').slice(0,2200):'none';}));
  log('BEAT: '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' ').slice(0,900):'none';}));
};
