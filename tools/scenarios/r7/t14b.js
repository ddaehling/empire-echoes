module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1200);
  for(let i=0;i<20;i++){
    if(/step=14/.test(await page.evaluate(()=>location.hash))) break;
    if(await page.evaluate(()=>!!document.querySelector('.qz'))){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(700);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(800); }
    let n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); let g=0;
    while(n&&g++<10){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b)b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      for(const t of document.querySelectorAll('.tr-panel textarea,.tr-panel input[type=text]')){if(!t.value){t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));}}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); }
    await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next'); if(x&&!x.disabled)x.click();});
    await page.waitForTimeout(1000);
  }
  log('HASH '+await page.evaluate(()=>location.hash));
  if(await page.evaluate(()=>!!document.querySelector('.qz'))){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(700);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(1000);}
  log('BEAT: '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' ').slice(0,1200):'none';}));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('twin');
  log('TWIN: '+await page.evaluate(()=>{const f=document.querySelector('.viz'); return f?f.innerText.replace(/\s+/g,' ').slice(0,2400):'none';}));
};
