module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Start the lesson/i.test(e.innerText)); b.focus(); b.click();});
  await page.waitForTimeout(1500);
  for (let step=1; step<=8; step++) {
    const before = await page.evaluate(()=>((document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||document.activeElement.tagName)+'').replace(/\s+/g,' ').slice(0,40));
    const clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>/^Next beat$/i.test(e.getAttribute('aria-label')||'')); if(b){b.focus(); b.click(); return true;} return false; });
    if (!clicked) { log('step '+step+': no Next (gate). focus was ' + before); 
      // count tabs to reach the gate control
      let n=-1; for(let i=0;i<30;i++){ await page.keyboard.press('Tab'); const f=await page.evaluate(()=>((document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||'')+'').replace(/\s+/g,' ').slice(0,40)); if(/place|field|Write the four|Say what each/i.test(f)){n=i;break;} }
      log('   tabs from body to the gate control: ' + n);
      break; }
    await page.waitForTimeout(1000);
    const after = await page.evaluate(()=>({el:((document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||document.activeElement.tagName)+'').replace(/\s+/g,' ').slice(0,40), isBody: document.activeElement===document.body}));
    log('after Next -> step '+(step+1)+' : focus=' + JSON.stringify(after));
  }
};
