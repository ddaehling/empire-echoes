module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await page.click('.cx-cta');
  await page.waitForTimeout(1400);

  const txt = () => page.evaluate(()=>{const p=document.querySelector('.tr-panel');return p?p.innerText.replace(/\s+/g,' ').slice(0,900):'';});
  const nextState = () => page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');return n?{l:n.innerText.replace(/\s+/g,' ').trim(),d:n.disabled}:null;});

  for (let i=1;i<=18;i++){
    const hash = await page.evaluate(()=>location.hash);
    log('##### STEP '+i+' '+hash);
    log('  '+(await txt()).slice(0,420));

    const acted = await page.evaluate(() => {
      const done=[];
      // 1. prediction with number
      const num=document.querySelector('.tr-num'); const go=document.querySelector('.tr-go');
      if(num && go && !go.disabled){ num.value='7'; num.dispatchEvent(new Event('input',{bubbles:true})); go.click(); done.push('predict'); }
      // 2. ordering
      const pool=[...document.querySelectorAll('.tr-order__pool .tr-order__btn')];
      if(pool.length){
        const want=['Parliament ends the British slave trade',"Bussa's rebellion in Barbados",'The Abolition Act takes effect','£1.72 million','Apprenticeship ends'];
        for(const w of want){
          const b=[...document.querySelectorAll('.tr-order__pool .tr-order__btn')].find(x=>x.innerText.includes(w));
          if(b) b.click();
        }
        done.push('order');
      }
      // 3. loop
      const lc=document.querySelector('.tr-loop__cut'); const ln=document.querySelector('.tr-loop__next');
      if(ln){ for(let k=0;k<4;k++) ln.click(); }
      if(lc){ lc.click(); done.push('loop-cut'); }
      // 4. sort (two-track)
      const rows=[...document.querySelectorAll('.tr-sort__row')];
      if(rows.length){
        const key={'Canada':0,'New Zealand':0,'British India':1,'Kenya':1};
        for(const r of rows){ const n=r.querySelector('.tr-sort__name').innerText.trim();
          const bs=[...r.querySelectorAll('.tr-sort__b')]; const pick=key[n]!==undefined?key[n]:0; if(bs[pick]) bs[pick].click(); }
        done.push('sort');
      }
      // 5. tension groups
      for (const g of document.querySelectorAll('.tr-tension__opts')) {
        const b=[...g.querySelectorAll('button')].filter(x=>!x.disabled)[0]; if(b){b.click();}
      }
      if(document.querySelector('.tr-tension__opts')) done.push('tension');
      // 6. princely word toggle
      for (const b of document.querySelectorAll('.tr-word__b, .tr-two__b')) { b.click(); done.push('word'); break; }
      return done;
    });
    log('  ACTED '+JSON.stringify(acted));
    await page.waitForTimeout(900);

    // any remaining blocker
    let ns = await nextState(); let g=0;
    while (ns && ns.d && g++<10) {
      const a = await page.evaluate(()=>{
        // fill text inputs (four-lines task)
        let did=null;
        for (const t of document.querySelectorAll('.tr-panel textarea, .tr-panel input[type=text]')) {
          if (!t.value) { t.value='A treaty concession, written by the company, to obtain mineral rights.'; t.dispatchEvent(new Event('input',{bubbles:true})); did='text'; }
        }
        if(did) return did;
        for (const g2 of document.querySelectorAll('.tr-tension__opts,.tr-sort__row')) { const b=[...g2.querySelectorAll('button')].filter(x=>!x.disabled)[0]; if(b){b.click(); return 'grp';} }
        const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click(); return 'cell';}
        const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/next|back|more of this|map/i.test(x.innerText))[0];
        if(b){ b.click(); return 'btn:'+b.innerText.trim().slice(0,30); }
        return null;
      });
      log('   UNBLOCK '+a);
      await page.waitForTimeout(750);
      ns = await nextState();
    }
    await shot('f'+String(i).padStart(2,'0'));
    const moved = await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next');if(!n||n.disabled)return false;n.click();return true;});
    if(!moved){ log('END at '+i); break; }
    await page.waitForTimeout(950);
    if (await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText))) { log('REACHED THE END at '+i); break; }
  }

  // sign the through-line, then open the close
  await page.waitForTimeout(800);
  await shot('preclose');
  const cl = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].find(x=>/finish here|finish and print|the close/i.test(x.innerText||''));
    if(b){b.click();return b.innerText.trim();} return null;
  });
  log('CLOSE-OPEN via '+cl);
  await page.waitForTimeout(1800);
  await shot('close');
  log('CLOSE TEXT:\n'+(await page.evaluate(()=>{const c=document.querySelector('.cl-close, .cl, [class*=cl-close]')||document.body; return c.innerText.slice(0,4500);})));
  log('ERRORS '+JSON.stringify(errs));
};
