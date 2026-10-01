module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.goto('http://localhost:8777/app/#tour=thirty&step=7',{waitUntil:'load'});
  await page.waitForTimeout(4000);
  await shot('recall');
  log('BAR: '+await page.evaluate(()=>{const b=document.querySelector('.tr-bar');return b?b.innerText.replace(/\s+/g,' '):'none';}));
  log('PANEL: '+await page.evaluate(()=>{const p=document.querySelector('.tr-panel')||document.querySelector('.qz');return p?p.innerText.replace(/\s+/g,' ').slice(0,1200):'none';}));
  const nx = await page.evaluate(()=>{ const out=[]; for(const b of document.querySelectorAll('button')){ const t=(b.innerText||'').trim(); if(!/next/i.test(t)) continue; out.push(String(b.className)+' | '+t.replace(/\s+/g,' ')+' | dis='+b.disabled+' | vis='+(!!b.offsetParent)); } return out.slice(0,8).join('  ;  '); });
  log('NEXTS: '+nx);
  // answer it
  await page.evaluate(()=>{const q=document.querySelector('.qz'); if(q){const r=q.querySelector('input[type=radio]'); if(r)r.click(); const o=[...q.querySelectorAll('button')].filter(x=>!x.disabled&&!/commit|skip/i.test(x.innerText))[0]; if(!r&&o)o.click();}});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^commit$/i.test(x.innerText.trim())&&!x.disabled); if(b)b.click();});
  await page.waitForTimeout(1600);
  await shot('answered');
  log('AFTER BAR: '+await page.evaluate(()=>{const b=document.querySelector('.tr-bar');return b?b.innerText.replace(/\s+/g,' '):'none';}));
  const mv=await page.evaluate(()=>{const n=document.querySelector('.tr-panel__next')||document.querySelector('.tr-bar__next'); if(!n)return 'no next el'; if(n.disabled)return 'disabled'; n.click(); return 'clicked';});
  log('MOVE '+mv);
  await page.waitForTimeout(1400);
  log('HASH '+await page.evaluate(()=>location.hash));
  log('ERR '+JSON.stringify(errs));
};
