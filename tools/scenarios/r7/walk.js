module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  const t0 = Date.now();
  await page.click('.cx-cta');
  await page.waitForTimeout(1300);

  const dump = () => page.evaluate(() => {
    const q = s => { const e=document.querySelector(s); return e? e.innerText.trim().replace(/\s+/g,' ') : null; };
    const nx = document.querySelector('.tr-bar__next');
    const panel = document.querySelector('.tr-panel');
    return {
      bar: q('.tr-bar'),
      count: q('.tr-bar__count, .tr-bar__pos, [class*=count]'),
      nextLabel: nx ? nx.innerText.trim().replace(/\s+/g,' ') : null,
      nextDisabled: nx ? nx.disabled : null,
      panel: panel ? panel.innerText.replace(/\s+/g,' ') : (q('.cx-panel')||''),
      year: q('.tl-year'),
      hash: location.hash,
    };
  });

  const seen=[];
  for (let i=1;i<=45;i++){
    let st = await dump();
    log('##### STEP '+i+'  hash='+st.hash+'  year='+st.year);
    log('  NEXT: '+JSON.stringify(st.nextLabel)+' disabled='+st.nextDisabled);
    log('  PANEL: '+String(st.panel).slice(0,1600));
    seen.push({i, hash:st.hash, panel:String(st.panel).slice(0,300)});
    let guard=0;
    while (st.nextDisabled && guard++ < 6) {
      const acted = await page.evaluate(() => {
        const pick = sels => { for (const s of sels){ const e=[...document.querySelectorAll(s)].filter(x=>!x.disabled && x.offsetParent); if(e.length){ e[0].click(); return s; } } return null; };
        return pick(['.tr-field__cell','.qz-opt','.dp-opt','.tr-opt','.tr-choice','button[class*=opt]','.tr-panel button:not([disabled])']);
      });
      log('   ACT: '+acted);
      await page.waitForTimeout(700);
      st = await dump();
    }
    if (st.nextDisabled) { log('   !!! STILL BLOCKED'); await shot('blocked'+i); }
    if ([1,2,3,6,9,12,15,18,21,24].includes(i)) await shot('s'+String(i).padStart(2,'0'));
    const moved = await page.evaluate(()=>{ const n=document.querySelector('.tr-bar__next'); if(!n||n.disabled) return false; n.click(); return true; });
    if(!moved){ log('!!! STUCK '+i); await shot('stuck'); break; }
    await page.waitForTimeout(850);
  }
  await page.waitForTimeout(1200);
  await shot('end');
  log('ELAPSED_MS '+(Date.now()-t0));
  log('FULLBODY:\n'+(await page.evaluate(()=>document.body.innerText)).slice(0,4000));
  log('ERRORS '+JSON.stringify(errs));
};
