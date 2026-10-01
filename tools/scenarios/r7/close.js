module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1200);
  // rush to the end
  for(let i=0;i<25;i++){
    if(await page.evaluate(()=>!!document.querySelector('.qz'))) { await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(700);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(700); }
    let n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;});
    let g=0;
    while(n&&g++<10){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b&&!gr.querySelector('[aria-pressed="true"]'))b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      for(const t of document.querySelectorAll('.tr-panel textarea,.tr-panel input[type=text]')){if(!t.value){t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));}}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); }
    const mv=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');if(!x||x.disabled)return false;x.click();return true;});
    if(!mv)break; await page.waitForTimeout(800);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText)))break;
  }
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/finish here/i.test(x.innerText||''));if(b)b.click();});
  await page.waitForTimeout(2200);
  await shot('close-top');
  const full = await page.evaluate(()=>{const c=document.querySelector('.cl-close')||document.querySelector('[class*=cl-]');return c?c.innerText:'none';});
  log('FULL CLOSE ('+full.length+' chars):\n'+full);
  // scroll to bottom of the close panel
  await page.evaluate(()=>{const c=document.querySelector('.cl-close')||document.body; const sc=c.closest('[class*=scroll]')||c.parentElement; if(sc) sc.scrollTop=sc.scrollHeight; window.scrollTo(0,document.body.scrollHeight);});
  await page.waitForTimeout(900);
  await shot('close-bottom');
  log('BUTTONS: '+await page.evaluate(()=>[...document.querySelectorAll('button,a')].map(b=>b.innerText.trim().replace(/\s+/g,' ')).filter(Boolean).join(' | ').slice(0,2000)));
  log('ERR '+JSON.stringify(errs));
};
