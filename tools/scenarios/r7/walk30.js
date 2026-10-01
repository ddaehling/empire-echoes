module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2600);
  await page.evaluate(()=>{location.hash='#tour=thirty&step=1';});
  await page.waitForTimeout(2600);
  const NEXT = () => page.evaluate(()=>{
    const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent);
    return c.length?{l:c[0].innerText.replace(/\s+/g,' ').trim(),d:c[0].disabled}:null;});
  const CLICK = () => page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled); if(!c.length)return false; c[0].click(); return true;});
  const seq=[];
  for(let i=1;i<=32;i++){
    const st=await page.evaluate(()=>({bar:(document.querySelector('.tr-bar')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,42), h:location.hash.replace(/&filter.*/,''), q:!!document.querySelector('.qz'), panel:((document.querySelector('.tr-panel')||{innerText:''}).innerText||'').replace(/\s+/g,' ').slice(0,120)}));
    seq.push(i+') '+st.bar+' :: '+st.h+(st.q?'  [QZ]':'')+' :: '+st.panel);
    // answer whatever
    await page.evaluate(()=>{
      const q=document.querySelector('.qz');
      if(q){const rng=q.querySelector('input[type=range]'); if(rng){rng.value=String((Number(rng.max)||6)*0.4);rng.dispatchEvent(new Event('input',{bubbles:true}));rng.dispatchEvent(new Event('change',{bubbles:true}));}
        const r=q.querySelector('input[type=radio]'); if(r)r.click();
        const o=[...q.querySelectorAll('button')].filter(x=>!x.disabled&&!/commit|skip/i.test(x.innerText))[0]; if(!r&&!rng&&o)o.click();
        const c=[...document.querySelectorAll('button')].find(x=>/^commit$/i.test(x.innerText.trim())&&!x.disabled); if(c)c.click(); }
    });
    await page.waitForTimeout(900);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||'')); if(b)b.click();});
    await page.waitForTimeout(700);
    let n=await NEXT(); let g=0;
    while(n&&n.d&&g++<10){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b)b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      for(const t of document.querySelectorAll('.tr-panel textarea,.tr-panel input[type=text]')){if(!t.value){t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));}}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await NEXT(); }
    if(!(await CLICK())){ log('NOMOVE '+i); break; }
    await page.waitForTimeout(900);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText))){log('END at '+i);break;}
  }
  log('SEQ:\n'+seq.join('\n'));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/finish here/i.test(x.innerText||''));if(b)b.click();});
  await page.waitForTimeout(2200);
  await shot('close30');
  log('CLOSE HEAD: '+await page.evaluate(()=>{const c=document.querySelector('.cl-close__stand');return c?c.innerText.replace(/\s+/g,' ').slice(0,700):'none';}));
  log('ERR '+JSON.stringify(errs));
};
