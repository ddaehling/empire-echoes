module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=7',{waitUntil:'load'});
  await page.waitForTimeout(3600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b)b.click();});
  await page.waitForTimeout(1500);
  const dom = await page.evaluate(()=>{const g=document.querySelector('[class*=viz-dots], [class*=dots]'); if(!g)return 'no dots';
    return g.className+' children='+g.children.length+' first='+(g.children[0]?g.children[0].outerHTML.slice(0,220):'');});
  log('DOTS: '+dom);
  const clicked = await page.evaluate(()=>{
    const g=document.querySelector('[class*=viz-dots]'); if(!g) return 'none';
    const kids=[...g.querySelectorAll('*')].filter(x=>/dot|cell/i.test(x.className||''));
    if(kids[59]){kids[59].click(); return 'clicked idx59 '+kids[59].className;}
    return 'kids='+kids.length;
  });
  log('CLICK: '+clicked);
  await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('reveal2');
  log('AFTER: '+await page.evaluate(()=>{const v=document.querySelector('[class*=viz-dots]'); const w=v?v.closest('section,div[class*=viz]'):null; return (w||document.body).innerText.replace(/\s+/g,' ').slice(0,1600);}));
};
