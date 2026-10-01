module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto(page.url().split('#')[0] + '#tour=lesson-one&step=5', { waitUntil:'load' });
  await page.waitForTimeout(12000);
  log('AT: '+await page.evaluate(()=>{const s=[...document.querySelectorAll('[aria-live]')].map(e=>e.innerText.trim()).filter(Boolean).pop();return s||'';}));
  await shot('gate');
  // keyboard only: tab until we find the gate field, then operate it
  let found=null;
  for(let i=0;i<60;i++){
    await page.keyboard.press('Tab');
    const f=await page.evaluate(()=>{const a=document.activeElement;if(!a)return null;
      return {tag:a.tagName,cls:String(a.className).slice(0,40),name:(a.getAttribute('aria-label')||a.innerText||'').trim().replace(/\s+/g,' ').slice(0,70),role:a.getAttribute('role')};});
    if(f && /gate|field|place|card|axis|drag/i.test(f.cls+f.name+(f.role||''))) { log('K'+i+' >>> '+JSON.stringify(f)); found=f; }
    else if(i<40) log('K'+i+'  '+JSON.stringify(f));
  }
  // try to place with keyboard
  const before = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^next/i.test(x.innerText.trim()));return b?{dis:b.disabled}:null;});
  log('NEXT before: '+JSON.stringify(before));
  log('ERR '+errs.length);
};
