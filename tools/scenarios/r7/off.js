module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600); await page.click('.cx-cta'); await page.waitForTimeout(1400);
  for(let i=0;i<9;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next'); if(n&&!n.disabled)n.click(); else{const c=document.querySelector('.tr-field__cell'); if(c)c.click();}}); await page.waitForTimeout(800); }
  const r = await page.evaluate(()=>{
    const vw=innerWidth,vh=innerHeight; const out=[];
    for(const b of document.querySelectorAll('button,a[href],input,select')){
      const q=b.getBoundingClientRect(); if(!q.width||!q.height)continue;
      const cs=getComputedStyle(b); if(cs.visibility==='hidden'||cs.display==='none')continue;
      if(q.right>vw+1||q.left<-1||q.bottom>vh+1||q.top<-1){
        let p=b.parentElement,ok=false,chain=[];
        while(p&&p!==document.body){chain.push(p.className.toString().slice(0,28)); const c=getComputedStyle(p); if(/auto|scroll/.test(c.overflowY)&&p.scrollHeight>p.clientHeight){ok=true;break;} p=p.parentElement;}
        if(!ok) out.push({txt:(b.innerText||b.getAttribute('aria-label')||b.title||'').trim().slice(0,40), cls:b.className.toString().slice(0,40), rect:[Math.round(q.top),Math.round(q.left),Math.round(q.width),Math.round(q.height)], chain:chain.slice(0,3)});
      }
    }
    return out;
  });
  log(JSON.stringify(r,null,1));
};
