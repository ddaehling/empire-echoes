module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2600);
  await shot('00-door');
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  const probe = () => page.evaluate(()=>{
    const vh=innerHeight, vw=innerWidth;
    const off=[];
    for(const b of document.querySelectorAll('button,a[href],input,select')){
      const r=b.getBoundingClientRect(); if(!r.width||!r.height) continue;
      const cs=getComputedStyle(b); if(cs.visibility==='hidden'||cs.display==='none')continue;
      if(r.bottom>vh+1||r.top<-1||r.right>vw+1||r.left<-1){
        // allow if inside a scrollable ancestor
        let p=b.parentElement, ok=false;
        while(p&&p!==document.body){const c=getComputedStyle(p); if(/auto|scroll/.test(c.overflowY)&&p.scrollHeight>p.clientHeight){ok=true;break;} p=p.parentElement;}
        if(!ok) off.push(b.innerText.trim().replace(/\s+/g,' ').slice(0,30)+' @'+Math.round(r.top)+','+Math.round(r.left));
      }
    }
    return {docScrollY: document.documentElement.scrollHeight-vh, docScrollX: document.documentElement.scrollWidth-vw, off,
      nextVisible: (()=>{const n=document.querySelector('.tr-panel__next')||document.querySelector('.tr-bar__next'); if(!n)return 'absent'; const r=n.getBoundingClientRect(); return Math.round(r.top)+','+Math.round(r.left)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' inview='+(r.bottom<=vh&&r.top>=0);})(),
      through: (()=>{const t=document.querySelector('.cl-blk, .cx-through, [class*=through]'); if(!t)return 'absent'; const r=t.getBoundingClientRect(); return Math.round(r.top)+' h'+Math.round(r.height)+' inview='+(r.bottom<=vh+1);})()};
  });
  for(let i=1;i<=20;i++){
    if(await page.evaluate(()=>!!document.querySelector('.qz'))){
      await shot('cp'+i);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(800);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(900);
    }
    const p=await probe();
    log('STEP '+i+' '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,'')+'  scrollY='+p.docScrollY+' scrollX='+p.docScrollX+' next='+p.nextVisible+' through='+p.through+' OFFSCREEN='+JSON.stringify(p.off));
    await shot('s'+String(i).padStart(2,'0'));
    let n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); let g=0;
    while(n&&g++<10){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b)b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      for(const t of document.querySelectorAll('.tr-panel textarea,.tr-panel input[type=text]')){if(!t.value){t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));}}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); }
    const mv=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');if(!x||x.disabled)return false;x.click();return true;});
    if(!mv){log('NOMOVE '+i);break;} await page.waitForTimeout(900);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText))){log('THE END at '+i);break;}
  }
  await shot('end');
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/finish here/i.test(x.innerText||''));if(b)b.click();});
  await page.waitForTimeout(2200);
  await shot('close');
  log('CLOSE PROBE '+JSON.stringify(await probe()));
  // sign
  const s=await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/^sign it$/i.test(x.innerText.trim())); if(b){b.click();return 'sign';} return null;});
  log('SIGN '+s); await page.waitForTimeout(1500); await shot('signed');
  const pr=await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/print my revision sheet/i.test(x.innerText||'')); if(b){const r=b.getBoundingClientRect(); return 'found '+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height);} return 'absent';});
  log('PRINT BUTTON '+pr);
  log('ERR '+JSON.stringify(errs));
};
