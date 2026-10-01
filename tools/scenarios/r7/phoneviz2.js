module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  for(let i=0;i<2;i++){ await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();}); await page.waitForTimeout(1300); }
  log('HASH '+(await page.evaluate(()=>location.hash)).replace(/&filter.*/,''));
  const before = await page.evaluate(()=>{const s=document.querySelector('.cx-sheet__body'); return s?{st:s.scrollTop, sh:s.scrollHeight, ch:s.clientHeight, ov:getComputedStyle(s).overflowY}:null;});
  log('SHEET BEFORE '+JSON.stringify(before));
  // wheel over the sheet
  const box = await page.evaluate(()=>{const s=document.querySelector('.cx-sheet__body'); const r=s.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2];});
  await page.mouse.move(box[0], box[1]);
  for(let i=0;i<8;i++){ await page.mouse.wheel(0, 200); await page.waitForTimeout(120); }
  await page.waitForTimeout(700);
  const after = await page.evaluate(()=>{const s=document.querySelector('.cx-sheet__body'); return s?{st:s.scrollTop, sh:s.scrollHeight, ch:s.clientHeight}:null;});
  log('SHEET AFTER WHEEL '+JSON.stringify(after));
  log('DOC scroll '+await page.evaluate(()=>window.scrollY+' / '+document.documentElement.scrollHeight));
  await shot('after-wheel');
  // is there a "MORE OF THIS BEAT" control and does it reveal?
  const more = await page.evaluate(()=>{const b=document.querySelector('.tr-panel__more'); return b?b.innerText.replace(/\s+/g,' ').trim()+' dis='+b.disabled:'none';});
  log('MORE CTRL: '+more);
  await page.evaluate(()=>{const b=document.querySelector('.tr-panel__more'); if(b&&!b.disabled)b.click();});
  await page.waitForTimeout(1200);
  await shot('after-more');
  log('AFTER MORE: '+JSON.stringify(await page.evaluate(()=>{const s=document.querySelector('.cx-sheet__body'); const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); const r=b?b.getBoundingClientRect():null; return {st:s.scrollTop, sh:s.scrollHeight, ch:s.clientHeight, commitTop:r?Math.round(r.top):null, vh:innerHeight};})));
  // press it again a few times
  for(let i=0;i<3;i++){ await page.evaluate(()=>{const b=document.querySelector('.tr-panel__more'); if(b&&!b.disabled)b.click();}); await page.waitForTimeout(900); }
  await shot('after-more3');
  log('AFTER MORE x4: '+JSON.stringify(await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); const r=b?b.getBoundingClientRect():null; return {commitTop:r?Math.round(r.top):null, vh:innerHeight, inview:r?(r.top>=0&&r.bottom<=innerHeight):null};})));
};
