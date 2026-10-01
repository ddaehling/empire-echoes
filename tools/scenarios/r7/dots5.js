module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=3',{waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:8777/app/#tour=core&step=7',{waitUntil:'load'});
  await page.waitForTimeout(4000);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b)b.click();});
  await page.waitForTimeout(1600);
  const r=await page.evaluate(()=>{const f=document.querySelector('.viz-dots__field'); const k=[...f.children]; if(k[59]){k[59].click(); return k[59].outerHTML.slice(0,150);} return 'n='+k.length;});
  log('DOT '+r);
  await page.waitForTimeout(600);
  log('READOUT '+await page.evaluate(()=>{const p=document.querySelector('.viz-dots__readout');return p?p.innerText.replace(/\s+/g,' '):'none';}));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('verdict');
  log('VERDICT: '+await page.evaluate(()=>{const v=document.querySelector('.viz-dots__verdict');return v?v.innerText.replace(/\s+/g,' ').slice(0,1600):'none';}));
};
