module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  for(let i=0;i<2;i++){ await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();}); await page.waitForTimeout(1400); }
  for(let k=0;k<8;k++){
    const st=await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/more of this beat/i.test(x.innerText));
      const s=document.querySelector('.tr-panel__scroll');
      const c=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText));
      const r=c?c.getBoundingClientRect():null;
      if(b) b.click();
      return {had:!!b, sc: s?s.scrollTop+'/'+s.scrollHeight+'@'+s.clientHeight:null, commitTop:r?Math.round(r.top):null, vh:innerHeight};
    });
    log('press '+k+' '+JSON.stringify(st));
    await page.waitForTimeout(1000);
    if(!st.had) break;
  }
  await shot('scrolled');
  log('FINAL: '+JSON.stringify(await page.evaluate(()=>{const c=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); const r=c?c.getBoundingClientRect():null; const s=document.querySelector('.tr-panel__scroll'); return {commitTop:r?Math.round(r.top):null, vh:innerHeight, inview:r?(r.top>=0&&r.bottom<=innerHeight):null, sc:s?s.scrollTop+'/'+s.scrollHeight+'@'+s.clientHeight:null};})));
  log('PANELTEXT TAIL: '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' ').slice(-700):'none';}));
};
