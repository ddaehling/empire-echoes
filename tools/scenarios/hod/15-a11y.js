module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(9000);
  // --- keyboard-only: can we start and complete lesson one with keys alone?
  const seen = [];
  for (let i=0;i<26;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{
      const a=document.activeElement; if(!a) return null;
      const r=a.getBoundingClientRect();
      const name = a.getAttribute('aria-label') || (a.innerText||'').trim().replace(/\s+/g,' ').slice(0,50) || a.getAttribute('title') || '';
      const cs=getComputedStyle(a);
      return {tag:a.tagName, name, cls:String(a.className).slice(0,40), x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),
        outline:cs.outlineWidth+' '+cs.outlineStyle, box:cs.boxShadow.slice(0,40)};
    });
    seen.push(f);
  }
  log('TAB ORDER:');
  seen.forEach((f,i)=>log(` ${i+1}. ${f?f.tag:'?'} "${f?f.name:''}" @${f?f.x+','+f.y:''} ${f?f.w+'x'+f.h:''} outline=${f?f.outline:''}`));
  // unnamed controls
  const unnamed = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('button,a[href],input,select,[tabindex]:not([tabindex="-1"])')];
    return els.filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      const n=(e.getAttribute('aria-label')||e.textContent||'').trim();
      return !n;
    }).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,50),id:e.id}));
  });
  log('UNNAMED FOCUSABLES: '+JSON.stringify(unnamed,null,1));
  // touch target sizes
  const small = await page.evaluate(()=>[...document.querySelectorAll('button,a[href]')].map(e=>{const r=e.getBoundingClientRect();return {n:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40),w:Math.round(r.width),h:Math.round(r.height)};}).filter(x=>x.w>0&&(x.h<24||x.w<24)));
  log('SMALL TARGETS (<24px): '+JSON.stringify(small,null,1));
  // landmarks + headings
  const lm = await page.evaluate(()=>({
    landmarks:[...document.querySelectorAll('main,nav,header,footer,aside,[role=main],[role=navigation],[role=region]')].map(e=>e.tagName+'/'+(e.getAttribute('aria-label')||'')),
    h:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.tagName+': '+e.innerText.trim().replace(/\s+/g,' ').slice(0,50)),
    live:[...document.querySelectorAll('[aria-live]')].map(e=>e.getAttribute('aria-live')+' :: '+e.innerText.trim().slice(0,60)),
    lang: document.documentElement.lang, title: document.title
  }));
  log('LANDMARKS: '+JSON.stringify(lm,null,1));
  await shot('focus-end');
};
