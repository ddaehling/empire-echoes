module.exports = async ({ page, shot, log }) => {
  const T = process.env.HOD_TOUR || 'lesson-one';
  await page.goto(page.url().split('#')[0] + '#tour='+T+'&step=1', { waitUntil:'load' });
  await page.waitForTimeout(11000);
  for (let i=0;i<14;i++){
    const c = await page.evaluate(()=>{const e=document.querySelector('.tr-bar__count'); return e?e.innerText.trim().replace(/\s+/g,' '):'?';});
    if(/THE END/i.test(c)){log('reached END at '+i);break;}
    await page.evaluate(()=>{
      const nx=document.querySelector('.tr-bar__next');
      if(nx && !nx.disabled) return;
      const cells=[...document.querySelectorAll('.tr-field__cell')];
      if(cells.length){cells[Math.floor(cells.length/2)].click();return;}
    });
    await page.waitForTimeout(1300);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/rather not|that is my guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(1100);
    const ok = await page.evaluate(()=>{const b=document.querySelector('.tr-bar__next'); if(b&&!b.disabled){b.click();return b.innerText.trim().replace(/\s+/g,' ');} return false;});
    log('['+i+'] '+c+' -> '+ok);
    if(!ok){log('STUCK');break;}
    await page.waitForTimeout(2800);
  }
  await page.waitForTimeout(2500);
  await shot('close3-'+T);
  const t=await page.evaluate(()=>document.body.innerText);
  const i=t.indexOf('What you can now defend');
  log('=== CLOSE ==='); log(t.slice(i, i+2200));
};
