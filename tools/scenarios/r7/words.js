module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  let total=0; const rows=[];
  const grab = async (tag) => {
    // expand "more of this beat"
    for(let k=0;k<2;k++){ const m=await page.evaluate(()=>{const b=document.querySelector('.tr-panel__more'); if(b&&!b.disabled&&/more of this beat/i.test(b.innerText)){b.click();return 1;}return 0;}); if(!m)break; await page.waitForTimeout(900); }
    const t = await page.evaluate(()=>{const p=document.querySelector('.tr-panel')||document.querySelector('.qz'); return p?p.innerText.replace(/\s+/g,' ').trim():'';});
    const w = t?t.split(/\s+/).length:0;
    total+=w; rows.push(tag+' '+w+'w');
    return w;
  };
  for(let i=1;i<=20;i++){
    const h=await page.evaluate(()=>location.hash);
    if(await page.evaluate(()=>!!document.querySelector('.qz'))){
      const w=await page.evaluate(()=>{const q=document.querySelector('.qz');return q?q.innerText.replace(/\s+/g,' ').split(/\s+/).length:0;});
      total+=w; rows.push('  CP@'+i+' '+w+'w');
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^skip/i.test(x.innerText.trim()));if(b)b.click();}); await page.waitForTimeout(800);
      await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/back to the (beat|lesson)/i.test(x.innerText||''));if(b)b.click();}); await page.waitForTimeout(900);
    }
    await grab('step'+i);
    let n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); let g=0;
    while(n&&g++<10){ await page.evaluate(()=>{
      const gob=[...document.querySelectorAll('.tr-tension__go')].filter(x=>!x.disabled)[0]; if(gob){gob.click();return;}
      for(const gr of document.querySelectorAll('.tr-tension__opts')){const b=gr.querySelector('button:not([disabled])'); if(b)b.click();}
      const c=[...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled&&x.offsetParent)[0]; if(c){c.click();return;}
      for(const t of document.querySelectorAll('.tr-panel textarea,.tr-panel input[type=text]')){if(!t.value){t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));}}
      const b=[...document.querySelectorAll('.tr-panel button')].filter(x=>!x.disabled&&x.offsetParent&&!/^next|^back|more of this|map|full record|the argument/i.test(x.innerText.trim()))[0]; if(b)b.click();});
      await page.waitForTimeout(600); n=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');return x?x.disabled:null;}); }
    const mv=await page.evaluate(()=>{const x=document.querySelector('.tr-panel__next');if(!x||x.disabled)return false;x.click();return true;});
    if(!mv)break; await page.waitForTimeout(900);
    if(await page.evaluate(()=>/THE END/.test((document.querySelector('.tr-bar')||{innerText:''}).innerText)))break;
  }
  log(rows.join('\n'));
  log('TOTAL WORDS ON THE REQUIRED PATH (panels + checkpoints, expanded): '+total);
  log('  at 180wpm '+(total/180).toFixed(1)+' min · at 150 '+(total/150).toFixed(1)+' · at 110 '+(total/110).toFixed(1));
};
