module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(900);
  await page.locator('text=Start the lesson').first().click();
  await page.waitForTimeout(1200);
  const t0 = Date.now();
  let seen = new Set(); let n=0; let totalWords=0;
  for (let i=0;i<70;i++){
    const state = await page.evaluate(()=>{
      const el=[...document.querySelectorAll('*')].find(e=>/^\d+\s*\/\s*\d+$/.test(e.textContent.trim())&&e.children.length===0);
      const body=document.body.innerText;
      return {pos: el?el.textContent.trim():'?', words: body.split(/\s+/).length,
        h: (document.querySelector('[data-mount=tourpanel] h1,[data-mount=tourpanel] h2, aside h2, aside h1')||{}).innerText||''};
    });
    if(!seen.has(state.pos)){ seen.add(state.pos); n++; totalWords+=state.words;
      log('BEAT '+state.pos+' ['+state.words+'w] '+state.h.replace(/\n/g,' ').slice(0,120)); }
    // try radio/gate first
    const acted = await page.evaluate(()=>{
      const vis=e=>e.offsetParent!==null;
      // radio-ish gate cells
      let r=[...document.querySelectorAll('input[type=radio]:not(:checked), [role=radio][aria-checked=false]')].filter(vis)[0];
      if(r){ r.click(); return 'radio'; }
      let c=[...document.querySelectorAll('button')].filter(vis).find(e=>/I think that is (true|false)|I am not sure/i.test(e.innerText));
      if(c && !c.getAttribute('aria-pressed')){ c.click(); return 'commit'; }
      return null;
    });
    if(acted){ await page.waitForTimeout(450); }
    const moved = await page.evaluate(()=>{
      const vis=e=>e.offsetParent!==null;
      const b=[...document.querySelectorAll('button,a')].filter(vis).find(e=>/^(next|continue|on →|next →|go on|finish|read it whole)/i.test(e.innerText.trim()));
      if(b && !b.disabled){ b.click(); return b.innerText.trim(); }
      return null;
    });
    if(!moved){
      const btns=await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>e.innerText.trim().replace(/\s+/g,' ')).slice(0,30));
      log('STUCK at '+state.pos+' :: '+btns.join(' | '));
      await shot('stuck-'+i);
      break;
    }
    await page.waitForTimeout(700);
  }
  log('DISTINCT BEATS: '+n+'  wall ms: '+(Date.now()-t0));
  await shot('end');
  log('END TEXT: '+(await page.evaluate(()=>document.body.innerText)).slice(0,2500));
};
