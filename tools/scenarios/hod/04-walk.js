module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.waitForTimeout(6000);
  const s = await page.$('text=Start the lesson'); if(s) await s.click();
  await page.waitForTimeout(2500);
  for (let i=1;i<=12;i++){
    const head = await page.evaluate(()=>{
      const p = document.querySelector('.tour, .tourpanel, [class*=tour]');
      return (p?p.innerText:document.body.innerText).replace(/\s+\n/g,'\n');
    });
    log(`\n########## STEP ${i} ##########\n`+head.slice(0,3500));
    await shot('step'+i);
    // find Next
    const nxt = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/^next/i.test((x.innerText||'').trim()));
      return b? {dis:b.disabled, t:b.innerText.trim()} : null;
    });
    log('NEXT: '+JSON.stringify(nxt));
    if(!nxt) break;
    if(nxt.dis){
      log('>> gate blocks. attempting to satisfy.');
      // try clicking a "rather not" / decline or committing a guess
      const opts = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.innerText.trim()).filter(Boolean));
      log('opts: '+JSON.stringify(opts.slice(0,40)));
      const decl = await page.$('text=I would rather not guess');
      if(decl){ await decl.click(); await page.waitForTimeout(900); }
      else {
        const t2 = await page.$('text=That is my guess'); if(t2){await t2.click();await page.waitForTimeout(900);}
      }
    }
    const ok = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/^next/i.test((x.innerText||'').trim()));
      if(!b||b.disabled) return false; b.click(); return true;
    });
    if(!ok){ log('>>> STUCK at step '+i); break; }
    await page.waitForTimeout(2200);
  }
  log('ERRORS '+errs.length+' '+errs.slice(0,5).join(' | '));
};
