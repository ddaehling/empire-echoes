module.exports = async ({ page, shot, log }) => {
  const T = process.env.HOD_TOUR || 'lesson-two';
  await page.goto(page.url().split('#')[0] + '#tour='+T+'&step=1', { waitUntil:'load' });
  await page.waitForTimeout(11000);
  for (let i=0;i<22;i++){
    const st = await page.evaluate(()=>{
      const c=[...document.querySelectorAll('.tr-bar__count,[class*=count]')].map(e=>e.innerText.trim()).find(Boolean)||'';
      const b=[...document.querySelectorAll('button')].map(x=>({t:x.innerText.trim().replace(/\s+/g,' '),d:x.disabled}));
      return {c, next:b.find(x=>/^next/i.test(x.t))||null, fin:b.find(x=>/^(finish|the end)/i.test(x.t))||null};
    });
    log(`[${i}] counter="${st.c}" next=${JSON.stringify(st.next)} fin=${JSON.stringify(st.fin)}`);
    if (st.next && st.next.d) {
      // gate: pick a cell then confirm
      const g = await page.evaluate(()=>{
        const cells=[...document.querySelectorAll('.tr-field__cell')];
        if(cells.length){cells[Math.floor(cells.length/2)].click();return 'cell';}
        const q=[...document.querySelectorAll('button')].find(x=>/that is my guess|I would rather not|commit/i.test(x.innerText));
        if(q){q.click();return 'commit';}
        return null;});
      log('   gate action: '+g);
      await page.waitForTimeout(1200);
      const g2 = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/place it|confirm|that is my|lock/i.test(x.innerText)&&!x.disabled); if(b){b.click();return b.innerText.trim();} return null;});
      log('   confirm: '+g2);
      await page.waitForTimeout(1500);
    }
    const moved = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/^(next|finish)/i.test(x.innerText.trim())&&!x.disabled);
      if(b){b.click();return b.innerText.trim().replace(/\s+/g,' ');}return null;});
    log('   pressed: '+moved);
    if(!moved){ log('>>> STUCK'); break; }
    await page.waitForTimeout(2600);
    const end = await page.evaluate(()=>/THE END/.test(document.body.innerText));
    if(end && i>6){ break; }
  }
  await page.waitForTimeout(2500);
  await shot('close-full-'+T);
  const t = await page.evaluate(()=>document.body.innerText);
  const i = t.indexOf('What you can now defend');
  log('=== CLOSE ===');
  log(t.slice(i>0?i-400:0, (i>0?i:0)+3000));
};
