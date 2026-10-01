module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2600);
  await page.click('.cx-cta');
  await page.waitForTimeout(1300);

  const satisfy = () => page.evaluate(() => {
    const acts = [];
    // one option per tension group
    for (const g of document.querySelectorAll('.tr-tension__opts')) {
      if (g.querySelector('[aria-pressed="true"], .is-picked, .is-on')) continue;
      const b = [...g.querySelectorAll('button')].filter(x=>!x.disabled)[0];
      if (b) { b.click(); acts.push('tension'); }
    }
    for (const g of document.querySelectorAll('.qz-opts, .dp-opts, .cx-ask__opts, .tr-opts')) {
      if (g.querySelector('[aria-pressed="true"], .is-picked, .is-on')) continue;
      const b = [...g.querySelectorAll('button')].filter(x=>!x.disabled)[0];
      if (b) { b.click(); acts.push('opts'); }
    }
    const cell = [...document.querySelectorAll('.tr-field__cell')].filter(x=>!x.disabled && x.offsetParent)[0];
    if (cell) { cell.click(); acts.push('cell'); }
    // any enabled call-to-action inside the ask
    for (const sel of ['.tr-tension__go','.cx-ask__go','.tr-ask button:not([disabled])','.tr-panel .btn:not([disabled])']) {
      const b = document.querySelector(sel);
      if (b && !b.disabled && b.offsetParent) { b.click(); acts.push('go:'+sel); break; }
    }
    return acts;
  });

  const dump = () => page.evaluate(() => {
    const q = s => { const e=document.querySelector(s); return e? e.innerText.trim().replace(/\s+/g,' ') : null; };
    const nx = document.querySelector('.tr-panel__next, .tr-bar__next');
    return {
      pos: q('.tr-bar__pos') || q('.tr-bar'),
      nextLabel: nx? nx.innerText.trim().replace(/\s+/g,' ').slice(0,50):null,
      nextDisabled: nx? nx.disabled : null,
      panel: (q('.tr-panel')||'').slice(0,2000),
      hash: location.hash,
    };
  });

  for (let i=1;i<=40;i++){
    let st = await dump();
    log('##### STEP '+i+' | '+st.hash);
    log('  POS: '+String(st.pos).slice(0,60)+' | NEXT: '+JSON.stringify(st.nextLabel)+' dis='+st.nextDisabled);
    log('  PANEL: '+st.panel);
    let g=0;
    while (st.nextDisabled && g++<8) { const a=await satisfy(); log('   ACT '+JSON.stringify(a)); await page.waitForTimeout(750); st=await dump(); }
    if (st.nextDisabled) { log('   STILL BLOCKED'); await shot('blk'+i); break; }
    await shot('t'+String(i).padStart(2,'0'));
    const moved = await page.evaluate(()=>{ const n=document.querySelector('.tr-panel__next, .tr-bar__next'); if(!n||n.disabled) return false; n.click(); return true; });
    if(!moved){ log('!!! END at '+i); break; }
    await page.waitForTimeout(900);
    const done = await page.evaluate(()=>!!document.querySelector('.cl-close, .close, [class*=close__]'));
  }
  await page.waitForTimeout(1500);
  await shot('zz-final');
  log('FINALBODY:\n'+(await page.evaluate(()=>document.body.innerText)).slice(0,5000));
  log('ERRORS '+JSON.stringify(errs));
};
