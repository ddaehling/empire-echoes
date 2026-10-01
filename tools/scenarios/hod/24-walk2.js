module.exports = async ({ page, shot, log }) => {
  const T = process.env.HOD_TOUR || 'lesson-one';
  await page.goto(page.url().split('#')[0] + '#tour='+T+'&step=1', { waitUntil:'load' });
  await page.waitForTimeout(11000);
  for (let i=0;i<16;i++){
    const c = await page.evaluate(()=>{const e=document.querySelector('.tr-bar__count'); return e?e.innerText.trim().replace(/\s+/g,' '):'?';});
    log('['+i+'] '+c);
    if(/THE END/i.test(c)) break;
    // satisfy any gate/commit
    await page.evaluate(()=>{
      const nx=[...document.querySelectorAll('button')].find(x=>/^Next/.test(x.innerText.trim()));
      if(nx && !nx.disabled) return;
      const cells=[...document.querySelectorAll('.tr-field__cell')];
      if(cells.length){cells[Math.floor(cells.length/2)].click();return;}
      const d=[...document.querySelectorAll('button')].find(x=>/rather not/i.test(x.innerText));
      if(d) d.click();
    });
    await page.waitForTimeout(1400);
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/rather not|that is my guess/i.test(x.innerText)&&!x.disabled); if(b)b.click();});
    await page.waitForTimeout(1200);
    const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Next/.test(x.innerText.trim())); if(b&&!b.disabled){b.click();return true;} 
      const f=[...document.querySelectorAll('button')].find(x=>/^Finish here/.test(x.innerText.trim())&&x.closest('.tr-bar')); if(f){f.click();return 'fin';} return false;});
    log('    moved='+ok);
    if(!ok){log('STUCK');break;}
    await page.waitForTimeout(2800);
  }
  await page.waitForTimeout(2000);
  await shot('close2-'+T);
  const t=await page.evaluate(()=>document.body.innerText);
  const i=t.indexOf('What you can now defend');
  log('=== CLOSE HEAD ===');
  log(t.slice(i, i+1800));
};
