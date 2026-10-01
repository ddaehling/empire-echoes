module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  await page.evaluate(()=>document.querySelector('.tr-panel__next, .tr-bar__next').click()); await page.waitForTimeout(1100);
  await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();}); await page.waitForTimeout(1600);
  log('HASH '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  await shot('a-beat3');
  const info = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText));
    if(!b) return {found:false};
    const r=b.getBoundingClientRect();
    let p=b.parentElement, chain=[];
    while(p&&p!==document.body){const cs=getComputedStyle(p); chain.push(String(p.className).slice(0,26)+' ovY='+cs.overflowY+' sh='+p.scrollHeight+'/'+p.clientHeight); p=p.parentElement;}
    return {found:true, rect:[Math.round(r.top),Math.round(r.left),Math.round(r.width),Math.round(r.height)], vh:innerHeight, chain:chain.slice(0,6)};
  });
  log('COMMIT INFO '+JSON.stringify(info,null,1));
  // try scrolling the panel
  const sc = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText));
    if(!b) return 'absent';
    b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect();
    return 'after scrollIntoView top='+Math.round(r.top)+' vh='+innerHeight+' inview='+(r.top>=0&&r.bottom<=innerHeight);
  });
  log('SCROLL '+sc);
  await page.waitForTimeout(800);
  await shot('b-scrolled');
  // can we actually click it?
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText));
    if(!b) return 'absent';
    const r=b.getBoundingClientRect(); const el=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
    return 'hit='+(el?el.tagName+'.'+String(el.className).slice(0,30):'null')+' contains='+(el?b.contains(el)||b===el:false);
  });
  log('HITTEST '+clicked);
  log('ERR '+JSON.stringify(errs));
};
