module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=3',{waitUntil:'load'});
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:8777/app/#tour=core&step=7',{waitUntil:'load'});
  await page.waitForTimeout(4000);
  const aux = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return b.innerText.trim();}return null;});
  log('AUX '+JSON.stringify(aux));
  await page.waitForTimeout(1600);
  await shot('open');
  const grid = await page.evaluate(()=>{const g=document.querySelector('.viz-dots__grid')||[...document.querySelectorAll('*')].find(x=>/dots__grid|viz-dots/.test(x.className||'')); return g?g.className+' n='+g.children.length+' sample='+(g.children[0]?g.children[0].outerHTML.slice(0,160):''):'none';});
  log('GRID '+grid);
  const r = await page.evaluate(()=>{
    const cand=[...document.querySelectorAll('*')].filter(x=>typeof x.className==='string'&&/viz-dots/.test(x.className));
    return cand.map(x=>x.tagName+'.'+x.className+'#'+x.children.length).slice(0,15).join(' | ');
  });
  log('CANDS '+r);
};
