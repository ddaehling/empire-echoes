module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=7',{waitUntil:'load'});
  await page.waitForTimeout(4200);
  log('AUX present: '+await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/count it/i.test(x.innerText)).map(x=>x.innerText.trim()+'|'+!!x.offsetParent).join(', ')));
  log('grid: '+await page.evaluate(()=>{const g=document.querySelector('.viz-dots__grid, .viz-dots, [class*=dots__]'); return g?g.className+' n='+g.children.length:'none';}));
  const r = await page.evaluate(()=>{
    const g=document.querySelector('.viz-dots__grid')||document.querySelector('[class*=dots__grid]');
    if(!g) return 'no grid';
    const kids=[...g.children];
    if(kids[59]) { kids[59].click(); return 'clicked '+kids[59].tagName+'.'+kids[59].className; }
    return 'n='+kids.length;
  });
  log('R: '+r);
  await page.waitForTimeout(600);
  const c = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); return b?('found dis='+b.disabled):'no commit btn';});
  log('COMMIT: '+c);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('rev');
  log('VERDICT: '+await page.evaluate(()=>{const v=document.querySelector('.viz-dots__verdict, [class*=verdict]'); return v?v.innerText.replace(/\s+/g,' ').slice(0,1400):'none';}));
};
