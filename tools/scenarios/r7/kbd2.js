module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(2800);
  await page.click('.cx-cta');
  await page.waitForTimeout(1800);
  log('FOCUS AFTER START: '+await page.evaluate(()=>{const a=document.activeElement;return a?a.tagName+'.'+String(a.className).slice(0,40)+' "'+(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)+'"':'none';}));
  const seen=[];
  for(let i=0;i<70;i++){
    await page.keyboard.press('Tab');
    const f=await page.evaluate(()=>{const a=document.activeElement; if(!a||a===document.body)return 'BODY';
      return a.tagName+'.'+String(a.className).slice(0,30)+' "'+(a.innerText||a.value||a.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,34)+'"';});
    seen.push(i+': '+f);
    if(/tr-bar__next|tr-panel__next/.test(f)){ log('NEXT reachable at tab '+i); break; }
  }
  log(seen.join('\n'));
  log('ERR '+JSON.stringify(errs));
};
