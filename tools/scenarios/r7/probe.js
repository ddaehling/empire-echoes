module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PE '+e.message)); page.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text());});
  await page.waitForTimeout(2800);
  // 1. timeline scrub via +1 / play
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()==='+1'); for(let i=0;i<5;i++) b.click();});
  await page.waitForTimeout(900);
  log('YEAR after +5: '+await page.evaluate(()=>{const y=document.querySelector('.tl-year, .tl__year, [class*=year]'); return y?y.innerText.trim():'?';}));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^▶?\s*Play$/i.test(x.innerText.trim())); if(b)b.click();});
  await page.waitForTimeout(2500);
  log('YEAR during play: '+await page.evaluate(()=>{const y=document.querySelector('[class*=tl-year],[class*=tl__year]'); return y?y.innerText.trim():'?'}));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/pause|▮|❚/i.test(x.innerText)); if(b)b.click();});
  await page.waitForTimeout(600);
  await shot('timeline');
  // 2. select a territory on the map by keyboard
  await page.evaluate(()=>{const t=document.querySelector('.map__target'); if(t){t.focus();}});
  for(let i=0;i<4;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250); }
  await page.waitForTimeout(1000);
  await shot('selected');
  log('SEL: '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  log('DOSSIER: '+await page.evaluate(()=>{const d=document.querySelector('.dsr, [class*=dossier], .cx-sheet'); return d?d.innerText.replace(/\s+/g,' ').slice(0,500):'none';}));
  // 3. search
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const s=await page.evaluate(()=>{const b=[...document.querySelectorAll('button,input')].find(x=>/find a place/i.test(x.innerText||x.placeholder||'')); if(b){b.click();return 'opened';}return 'no search';});
  log('SEARCH '+s);
  await page.waitForTimeout(700);
  await page.keyboard.type('Amritsar');
  await page.waitForTimeout(1200);
  await shot('search');
  log('RESULTS: '+await page.evaluate(()=>{const r=document.querySelector('[class*=sr-],[class*=search]'); return r?r.innerText.replace(/\s+/g,' ').slice(0,500):'none';}));
  log('ERR '+JSON.stringify(errs));
};
