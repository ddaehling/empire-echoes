module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.waitForTimeout(2600);
  const t0=Date.now();
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  const cps=[];

  const doCheckpoint = async (i) => {
    if(!(await page.evaluate(()=>!!document.querySelector('.qz')))) return false;
    const q = await page.evaluate(()=>document.querySelector('.qz').innerText.replace(/\s+/g,' ').slice(0,260));
    const n = await page.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>/CHECKPOINT \d+ OF \d+/i.test(x.textContent)&&x.children.length===0);return e?e.textContent.trim():'?';});
    cps.push('step '+i+' @'+((Date.now()-t0)/1000).toFixed(0)+'s  '+n+' :: '+q.slice(0,180));
    await shot('cp'+i);
    await page.evaluate(()=>{const w=document.querySelector('.qz');
      const rng=w.querySelector('input[type=range]'); if(rng){rng.value=String((Number(rng.max)||6)*0.4);rng.dispatchEvent(new Event('input',{bubbles:true}));rng.dispatchEvent(new Event('change',{bubbles:true}));}
      const rads=[...w.querySelectorAll('input[type=radio]')]; if(rads.length)rads[0].click();
      const opt=[...w.querySelectorAll('button')].filter(x=>!x.disabled&&!/commit|skip/i.test(x.innerText))[0]; if(!rads.length&&opt)opt.click();});
    await page.waitForTimeout(450);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^commit$/i.test(x.innerText.trim())&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(1500);
    // follow-up chain: keep committing / continue until 'back to the lesson'
    for(let k=0;k<4;k++){
      const back=await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||'')); if(b){b.click();return 1;}return 0;});
      if(back){ await page.waitForTimeout(1300); break; }
      const more=await page.evaluate(()=>{const b=[...document.querySelectorAll('.qz button,button')].find(x=>!x.disabled&&/^(commit|continue|next question|go on)$/i.test(x.innerText.trim())); if(b){b.click();return 1;}
        const r=document.querySelector('.qz input[type=radio]'); if(r){r.click();return 1;} return 0;});
      if(!more) break;
      await page.waitForTimeout(1100);
    }
    if(await page.evaluate(()=>!!document.querySelector('.qz'))){
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim())); if(b)b.click();});
      await page.waitForTimeout(1200);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||'')); if(b)b.click();});
      await page.waitForTimeout(1200);
    }
    return true;
  };

  for(let i=1;i<=22;i++){
    const hash=await page.evaluate(()=>location.hash);
    await doCheckpoint(i);
    const a = await page.evaluate(()=>{
      const done=[];
      const num=document.querySelector('.tr-num'), go=document.querySelector('.tr-go');
      if(num&&go&&!go.disabled){num.value='12';num.dispatchEvent(new Event('input',{bubbles:true}));go.click();done.push('predict');}
      if(document.querySelector('.tr-order__pool .tr-order__btn')){
        const want=['Parliament ends the British slave trade',"Bussa's rebellion",'The Abolition Act takes effect','£1.72','Apprenticeship ends'];
        for(const w of want){const b=[...document.querySelectorAll('.tr-order__pool .tr-order__btn')].find(x=>x.innerText.includes(w)); if(b)b.click();}
        done.push('order');}
      const ln=document.querySelector('.tr-loop__next'); if(ln){for(let k=0;k<4;k++)ln.click();}
      const lc=document.querySelector('.tr-loop__cut'); if(lc){lc.click();done.push('loopcut');}
      const rows=[...document.querySelectorAll('.tr-sort__row')];
      if(rows.length){const key={'Canada':0,'New Zealand':0,'British India':1,'Kenya':1};
        for(const r of rows){const nm=r.querySelector('.tr-sort__name').innerText.trim();const bs=[...r.querySelectorAll('.tr-sort__b')];const p=key[nm]!==undefined?key[nm]:0;if(bs[p])bs[p].click();}
        done.push('sort');}
      const groups=[...document.querySelectorAll('.tr-tension__opts')];
      if(groups.length){ for(const g of groups){ const bs=[...g.querySelectorAll('button')]; if(bs[0]) bs[0].click(); } done.push('tension:'+groups.length); }
      for(const t of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')){ if(!t.value){t.value='A concession deed drafted by the concession-seekers, to obtain mineral rights.'; t.dispatchEvent(new Event('input',{bubbles:true})); done.push('text');} }
      const gob=[...document.querySelectorAll('.tr-tension__go, .tr-ask .btn')].filter(x=>!x.disabled)[0]; if(gob){gob.click(); done.push('go:'+gob.innerText.trim().slice(0,25));}
      return done;});
    await page.waitForTimeout(950);
    const a2 = await page.evaluate(()=>{
      const done=[];
      const rows=[...document.querySelectorAll('.tr-sort__row')];
      if(rows.length){const key={'Canada':0,'New Zealand':0,'British India':1,'Kenya':1};
        for(const r of rows){const nm=r.querySelector('.tr-sort__name').innerText.trim();const bs=[...r.querySelectorAll('.tr-sort__b')];const p=key[nm]!==undefined?key[nm]:0;if(bs[p])bs[p].click();}
        done.push('sort2');}
      const num=document.querySelector('.tr-num'), go=document.querySelector('.tr-go');
      if(num&&go&&!go.disabled){num.value='30';num.dispatchEvent(new Event('input',{bubbles:true}));go.click();done.push('predict2');}
      const lc=document.querySelector('.tr-loop__cut'); if(lc&&!lc.disabled){lc.click();done.push('loopcut2');}
      return done;});
    await page.waitForTimeout(700);
    log('##### STEP '+i+' '+hash+' acted='+JSON.stringify(a)+' / '+JSON.stringify(a2));
    let ns=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');return n?n.disabled:null;});
    let g=0;
    while(ns&&g++<8){
      const act=await page.evaluate(()=>{
        const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return 'go';}
        const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return 'cell';}
        const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument|penned|meeting|troops|believed|defend|shift|garden|punjab|official|prosecut|refusal|command|explains|shows/i.test(x.innerText.trim()))[0];
        if(b){b.click();return 'btn:'+b.innerText.trim().slice(0,28);} return null;});
      log('   UNBLOCK '+act);
      await page.waitForTimeout(700);
      ns=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');return n?n.disabled:null;});
    }
    if(ns){ log('   STILL BLOCKED '+i); await shot('blk'+i); }
    const moved=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');if(!n||n.disabled)return false;n.click();return true;});
    if(!moved){log('NO MOVE at '+i);break;}
    await page.waitForTimeout(1000);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText))){log('THE END at step '+i); await doCheckpoint(i+'end'); break;}
  }
  log('CHECKPOINTS:\n'+cps.join('\n'));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/finish here/i.test(x.innerText||'')); if(b)b.click();});
  await page.waitForTimeout(2400);
  await shot('close');
  log('CLOSE:\n'+(await page.evaluate(()=>{const c=document.querySelector('.cl-close')||document.body;return c.innerText.slice(0,1800);})));
  log('ELAPSED '+((Date.now()-t0)/1000).toFixed(0)+'s');
  log('ERR '+JSON.stringify(errs));
};
