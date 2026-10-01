module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2600);
  const t0=Date.now();
  await page.click('.cx-cta'); await page.waitForTimeout(1400);

  const handleCheckpoint = async () => {
    const has = await page.evaluate(()=>!!document.querySelector('.qz'));
    if(!has) return null;
    const head = await page.evaluate(()=>{const q=document.querySelector('.qz');const r=q.closest('[class]');return (document.querySelector('.cx-rail, .cx-panel')||q).innerText.replace(/\s+/g,' ').slice(0,320);});
    await page.evaluate(()=>{
      const q=document.querySelector('.qz');
      const rad=q.querySelector('input[type=radio]'); if(rad){rad.click();return;}
      const rng=q.querySelector('input[type=range]'); if(rng){rng.value=String(Number(rng.max)/2); rng.dispatchEvent(new Event('input',{bubbles:true})); rng.dispatchEvent(new Event('change',{bubbles:true})); return;}
      const b=[...q.querySelectorAll('button')].filter(x=>!x.disabled && !/commit|skip/i.test(x.innerText))[0]; if(b)b.click();
    });
    await page.waitForTimeout(500);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('.qz button, button')].find(x=>/^commit$/i.test(x.innerText.trim())&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(1300);
    const after = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button,a')].find(x=>/back to the beat/i.test(x.innerText||''));
      if(b){b.click();return 'back-to-beat';}
      const c=document.querySelector('.qz__close, .cx-rail__close, [aria-label*=lose]');
      if(c){c.click();return 'closed';}
      return 'left-open';
    });
    await page.waitForTimeout(1200);
    return head+' || exit='+after;
  };

  const handleBeat = () => page.evaluate(()=>{
    const done=[];
    const num=document.querySelector('.tr-num'), go=document.querySelector('.tr-go');
    if(num&&go&&!go.disabled){num.value='12';num.dispatchEvent(new Event('input',{bubbles:true}));go.click();done.push('predict');}
    if(document.querySelector('.tr-order__pool .tr-order__btn')){
      const want=['Parliament ends the British slave trade',"Bussa's rebellion",'The Abolition Act takes effect','£1.72','Apprenticeship ends'];
      for(const w of want){const b=[...document.querySelectorAll('.tr-order__pool .tr-order__btn')].find(x=>x.innerText.includes(w)); if(b)b.click();}
      done.push('order');
    }
    const ln=document.querySelector('.tr-loop__next'); if(ln){for(let k=0;k<4;k++)ln.click();}
    const lc=document.querySelector('.tr-loop__cut'); if(lc){lc.click();done.push('loopcut');}
    const rows=[...document.querySelectorAll('.tr-sort__row')];
    if(rows.length){const key={'Canada':0,'New Zealand':0,'British India':1,'Kenya':1};
      for(const r of rows){const n=r.querySelector('.tr-sort__name').innerText.trim();const bs=[...r.querySelectorAll('.tr-sort__b')];const p=key[n]!==undefined?key[n]:0;if(bs[p])bs[p].click();}
      done.push('sort');}
    const groups=[...document.querySelectorAll('.tr-tension__opts')];
    if(groups.length){ groups.forEach((g,gi)=>{const bs=[...g.querySelectorAll('button')]; if(bs[gi%bs.length]) bs[gi%bs.length].click();}); done.push('tension'); }
    for(const t of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')){ if(!t.value){t.value='A concession deed drafted by the concession-seekers, to obtain mineral rights.'; t.dispatchEvent(new Event('input',{bubbles:true})); done.push('text');} }
    return done;
  });

  const cps=[];
  for(let i=1;i<=20;i++){
    const hash=await page.evaluate(()=>location.hash);
    const cp = await handleCheckpoint();
    if(cp){ cps.push('STEP '+i+' @'+((Date.now()-t0)/1000).toFixed(0)+'s :: '+cp); log('  *** CHECKPOINT: '+cp); }
    const a = await handleBeat();
    await page.waitForTimeout(900);
    log('##### STEP '+i+' '+hash+' acted='+JSON.stringify(a));
    // gate / residual blockers
    let ns=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');return n?{l:n.innerText.replace(/\s+/g,' ').trim(),d:n.disabled}:null;});
    let g=0;
    while(ns&&ns.d&&g++<12){
      const act=await page.evaluate(()=>{
        const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return 'cell';}
        const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0];
        if(b){b.click();return 'btn:'+b.innerText.trim().slice(0,32);} return null;});
      log('   UNBLOCK '+act);
      await page.waitForTimeout(700);
      ns=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');return n?{l:n.innerText.replace(/\s+/g,' ').trim(),d:n.disabled}:null;});
    }
    if(ns&&ns.d){ log('   STILL BLOCKED at '+i); await shot('blk'+i); }
    const moved=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');if(!n||n.disabled)return false;n.click();return true;});
    if(!moved){log('NO MOVE at '+i);break;}
    await page.waitForTimeout(1000);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText))){log('THE END at '+i); break;}
  }
  log('CHECKPOINTS:\n'+cps.join('\n'));
  await page.waitForTimeout(600);
  // sign the through-line
  const sign = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/finish here/i.test(x.innerText||'')); if(b){b.click();return 'finish-here';} return null;});
  log('OPENCLOSE '+sign);
  await page.waitForTimeout(2200);
  await shot('close');
  log('CLOSE:\n'+(await page.evaluate(()=>{const c=document.querySelector('.cl-close')||document.body;return c.innerText.slice(0,2600);})));
  log('ELAPSED '+((Date.now()-t0)/1000).toFixed(0)+'s');
  log('ERR '+JSON.stringify(errs));
};
