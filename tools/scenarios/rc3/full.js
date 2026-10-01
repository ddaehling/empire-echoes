module.exports = async ({ page, shot, log }) => {
  const t0 = Date.now();
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Start the lesson/i.test(e.innerText)); b.click();});
  await page.waitForTimeout(1400);
  const hasNext = () => page.evaluate(()=>!![...document.querySelectorAll('button')].find(b=>/^Next beat$|^Finish the lesson$/i.test((b.getAttribute('aria-label')||'').trim())));
  const clickNext = () => page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Next beat$|^Finish the lesson$/i.test((b.getAttribute('aria-label')||'').trim())); if(b){b.click();return b.getAttribute('aria-label');} return null;});
  const satisfy = async () => {
    // jump to field
    await page.evaluate(()=>{const j=[...document.querySelectorAll('button')].find(b=>/the field|place the fact/i.test(b.getAttribute('aria-label')||b.innerText)); if(j)j.click();});
    await page.waitForTimeout(500);
    // gate grid: focus a radio and press Enter
    const rn = await page.evaluate(()=>document.querySelectorAll('[role=radio]').length);
    if (rn) {
      const r = page.locator('[role=radio]').nth(Math.min(1, rn-1));
      await r.scrollIntoViewIfNeeded().catch(()=>{});
      await r.focus().catch(()=>{});
      await page.keyboard.press('Enter'); await page.waitForTimeout(300);
      await page.keyboard.press('Space'); await page.waitForTimeout(500);
      await r.click({force:true}).catch(()=>{});
      await page.waitForTimeout(700);
    }
    // textareas: type
    const tn = await page.locator('textarea').count();
    for (let k=0;k<tn;k++){ const ta=page.locator('textarea').nth(k); await ta.scrollIntoViewIfNeeded().catch(()=>{}); await ta.click().catch(()=>{}); await ta.pressSequentially('A concession document of 1888 made for the company; it cannot record what was said aloud.', {delay:1}).catch(()=>{}); await page.waitForTimeout(200); }
    // choice buttons (question rows)
    for (let pass=0; pass<6; pass++) {
      const did = await page.evaluate(()=>{
        const btns=[...document.querySelectorAll('button,[role=radio]')].filter(e=>e.offsetParent && e.getAttribute('aria-checked')!=='true' && /^(That the|That his|To be|To defend|To shift|What happened|The official|To have|To make|To take|Dyer|Tagore|Neither|Its own elected|No elected|It fits|It strains|It breaks|1820|1770|About the same)/.test(e.innerText.trim()));
        if(btns.length){btns[0].click(); return btns[0].innerText.slice(0,30);} return null; });
      if(!did) break; await page.waitForTimeout(350);
    }
    // sliders
    await page.evaluate(()=>{ document.querySelectorAll('input[type=range]').forEach(s=>{ s.value = Math.round((+s.min + +s.max)/2); s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true})); }); });
    await page.waitForTimeout(300);
    // commit buttons
    for (let pass=0;pass<4;pass++){
      const c = await page.evaluate(()=>{ const rx=/Now show me this atlas|Show me what they wrote|That is my guess|Commit both guesses|^Commit$|^Weigh it up$|Show me the record|Place it/i;
        const b=[...document.querySelectorAll('button')].find(b=>b.offsetParent && !b.disabled && rx.test((b.getAttribute('aria-label')||b.innerText).trim())); if(b){b.click(); return b.innerText.trim().slice(0,40);} return null; });
      if(!c) break; log('    commit: '+c); await page.waitForTimeout(900);
    }
  };
  for (let i=1;i<=24;i++){
    const bar = await page.evaluate(()=>document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,70)||'');
    log('STEP ' + i + ' | ' + bar);
    let tries=0;
    while (!(await hasNext()) && tries<4){ await satisfy(); tries++; }
    if (!(await hasNext())) { log('  BLOCKED'); await shot('blk'+i); break; }
    const lbl = await clickNext();
    await page.waitForTimeout(1100);
    if (/Finish/i.test(lbl||'')) { log('  finished via ' + lbl); break; }
  }
  await page.waitForTimeout(1500);
  await shot('after-finish');
  log('elapsed ' + ((Date.now()-t0)/1000).toFixed(0) + 's (machine)');
  log('END >>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,4000));
};
