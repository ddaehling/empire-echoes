module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2800);
  const path=[];
  for(let i=0;i<40;i++){
    await page.keyboard.press('Tab');
    const f=await page.evaluate(()=>{const a=document.activeElement; if(!a)return 'none';
      const r=a.getBoundingClientRect(); const cs=getComputedStyle(a);
      return (a.tagName+'.'+String(a.className).slice(0,28)+' "'+(a.innerText||a.value||a.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,32)+'" vis='+(r.width>0&&r.height>0)+' out='+(cs.outlineStyle!=='none'||cs.boxShadow!=='none'));});
    path.push(i+': '+f);
    if(/cx-cta/.test(f)) { log('CTA reached at tab '+i); break; }
  }
  log(path.join('\n'));
  await shot('focus');
  // activate the CTA with the keyboard
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1600);
  log('AFTER ENTER hash='+await page.evaluate(()=>location.hash));
  // now step the route with the keyboard only
  for(let k=0;k<6;k++){
    let found=false;
    for(let t=0;t<40;t++){
      await page.keyboard.press('Tab');
      const isNext=await page.evaluate(()=>{const a=document.activeElement; return a&&/tr-bar__next|tr-panel__next/.test(String(a.className));});
      if(isNext){found=true;break;}
    }
    if(!found){log('could not tab to Next at k='+k);break;}
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    log('k'+k+' hash='+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  }
  await shot('kbd-end');
  log('ERR '+JSON.stringify(errs));
};
