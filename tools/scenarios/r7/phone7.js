module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  const target = Number(process.env.R7STEP||7);
  for(let i=0;i<24;i++){
    const h=await page.evaluate(()=>location.hash);
    const m=/step=(\d+)/.exec(h); if(m&&Number(m[1])>=target) break;
    let n=await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent)[0];return c?c.disabled:null;}); let g=0;
    while(n&&g++<8){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b)b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent)[0];return c?c.disabled:null;}); }
    if(await page.evaluate(()=>!!document.querySelector('.qz'))){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(700);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(800); }
    await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();});
    await page.waitForTimeout(1200);
  }
  log('HASH '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  await shot('at');
  log('AUX vis: '+await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/count it/i.test(x.innerText)).map(x=>'"'+x.innerText.trim()+'" vis='+(!!x.offsetParent)).join(' ; ')));
  log('VIZ REACH: '+await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/commit (this|both) guess/i.test(x.innerText));
    if(!b) return 'no commit button in DOM';
    const r=b.getBoundingClientRect();
    let p=b.parentElement,sc=null; while(p&&p!==document.body){const cs=getComputedStyle(p); if(/auto|scroll/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+4){sc=String(p.className).slice(0,26);break;} p=p.parentElement;}
    return 'top='+Math.round(r.top)+' vh='+innerHeight+' inview='+(r.top>=0&&r.bottom<=innerHeight)+' scroller='+sc;}));
};
