module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.cx-cta'); await page.waitForTimeout(1400);
  for(let i=0;i<2;i++){ await page.evaluate(()=>{const c=[...document.querySelectorAll('.tr-bar__next,.tr-panel__next')].filter(b=>b.offsetParent&&!b.disabled)[0]; if(c)c.click();}); await page.waitForTimeout(1300); }
  log('SCROLLERS: '+await page.evaluate(()=>{
    const out=[]; for(const e of document.querySelectorAll('#app *')){ const cs=getComputedStyle(e);
      if(/auto|scroll/.test(cs.overflowY) && e.scrollHeight>e.clientHeight+4) out.push(String(e.className).slice(0,34)+' '+e.scrollHeight+'/'+e.clientHeight); }
    return out.slice(0,10).join(' ; ');}));
  log('AUX: '+await page.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/count it/i.test(x.innerText)).map(x=>'"'+x.innerText.trim().replace(/\s+/g,' ')+'" vis='+(!!x.offsetParent)+' cls='+String(x.className).slice(0,26)).join(' ; ')));
  log('PANELSCROLL: '+await page.evaluate(()=>{const s=document.querySelector('.tr-panel__scroll'); return s?String(s.className)+' '+s.scrollHeight+'/'+s.clientHeight+' ov='+getComputedStyle(s).overflowY:'absent';}));
  // click the aux
  const a=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return b.innerText.trim();}return null;});
  log('CLICK AUX '+JSON.stringify(a));
  await page.waitForTimeout(1600);
  await shot('aux-open');
  log('COMMIT NOW: '+await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/commit this guess/i.test(x.innerText)); if(!b)return 'absent'; const r=b.getBoundingClientRect(); let p=b.parentElement,sc=null; while(p&&p!==document.body){const cs=getComputedStyle(p); if(/auto|scroll/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight){sc=String(p.className).slice(0,30)+' '+p.scrollHeight+'/'+p.clientHeight;break;} p=p.parentElement;} return 'top='+Math.round(r.top)+' vh='+innerHeight+' inview='+(r.top>=0&&r.bottom<=innerHeight)+' scroller='+sc;}));
};
