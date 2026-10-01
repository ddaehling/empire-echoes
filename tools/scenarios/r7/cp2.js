module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1300);
  // walk to step 12
  for(let i=0;i<20;i++){
    const h=await page.evaluate(()=>location.hash);
    if(/step=12/.test(h)) break;
    const cp=await page.evaluate(()=>!!document.querySelector('.qz'));
    if(cp){ await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim())); if(b)b.click();}); await page.waitForTimeout(900); }
    let n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;});
    let g=0;
    while(n&&g++<8){ await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0];if(c){c.click();return;}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); }
    await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next'); if(x&&!x.disabled)x.click();});
    await page.waitForTimeout(1000);
  }
  log('HASH '+await page.evaluate(()=>location.hash));
  await page.waitForTimeout(1500);
  await shot('at12');
  log('QZ? '+await page.evaluate(()=>!!document.querySelector('.qz')));
  const dom=await page.evaluate(()=>{const q=document.querySelector('.qz'); if(!q)return 'none';
    const walk=(el,d)=>{if(!el||d>6)return '';let s='';for(const c of el.children){const t=c.tagName.toLowerCase();
      s+='  '.repeat(d)+t+'.'+(c.className||'').toString().slice(0,50)+((t==='button'||t==='input'||t==='label')?(' ["'+(c.innerText||c.value||'').trim().slice(0,35)+'" dis='+c.disabled+' type='+(c.type||'')+']'):'')+'\n'; s+=walk(c,d+1);}return s;};
    return walk(q,0).slice(0,2500);});
  log(dom);
  // commit
  await page.evaluate(()=>{const q=document.querySelector('.qz'); if(!q)return;
    const rng=q.querySelector('input[type=range]'); if(rng){rng.value='2.5';rng.dispatchEvent(new Event('input',{bubbles:true}));rng.dispatchEvent(new Event('change',{bubbles:true}));}
    const rad=q.querySelector('input[type=radio]'); if(rad)rad.click();});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^commit$/i.test(x.innerText.trim())&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('committed');
  log('AFTER COMMIT BODY-RAIL: '+await page.evaluate(()=>{const q=document.querySelector('.qz');return q?q.innerText.replace(/\s+/g,' ').slice(0,900):'no qz';}));
  log('BUTTONS: '+await page.evaluate(()=>[...document.querySelectorAll('button,a')].map(b=>b.innerText.trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,40).join(' | ')));
  log('SORTROWS '+await page.evaluate(()=>document.querySelectorAll('.tr-sort__row').length));
  // try back to beat
  const bb=await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||'')); if(b){b.click();return 'yes';}return 'no';});
  log('BACKTOBEAT '+bb);
  await page.waitForTimeout(1500);
  await shot('afterback');
  log('SORTROWS NOW '+await page.evaluate(()=>document.querySelectorAll('.tr-sort__row').length));
  log('PANEL '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' ').slice(0,500):'none';}));
  log('ERR '+JSON.stringify(errs));
};
