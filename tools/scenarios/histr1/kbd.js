module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2500);
  // keyboard only from a cold start
  let started=false;
  for (let i=0;i<20 && !started;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{const e=document.activeElement;return (e.getAttribute&&e.getAttribute('aria-label'))||e.textContent||'';});
    if (/start the lesson/i.test(a)) { await page.keyboard.press('Enter'); started=true; log('started via Tab #'+(i+1)); }
  }
  await page.waitForTimeout(1200);
  let steps=0;
  for (let n=0;n<40;n++){
    const st = await page.evaluate(()=>(window.BEA&&window.BEA.toursState)||{});
    if (st.done) { log('reached done'); break; }
    // Tab until Next/Finish, press Enter
    let hit=false;
    for (let i=0;i<40 && !hit;i++){
      await page.keyboard.press('Tab');
      const a = await page.evaluate(()=>{const e=document.activeElement;return ((e.getAttribute&&e.getAttribute('aria-label'))||e.textContent||'').trim();});
      if (/^next beat$|^finish the lesson$/i.test(a)) { await page.keyboard.press('Enter'); hit=true; steps++; }
    }
    if (!hit) { log('COULD NOT REACH NEXT by keyboard at step '+steps); break; }
    await page.waitForTimeout(600);
  }
  log('keyboard advances: '+steps);
  // final: press Finish
  for (let i=0;i<40;i++){
    await page.keyboard.press('Tab');
    const a = await page.evaluate(()=>{const e=document.activeElement;return ((e.getAttribute&&e.getAttribute('aria-label'))||e.textContent||'').trim();});
    if (/finish the lesson/i.test(a)) { await page.keyboard.press('Enter'); log('pressed Finish'); break; }
  }
  await page.waitForTimeout(2000);
  await shot('kbd-end');
  log('final: ' + (await page.evaluate(()=>document.body.innerText)).slice(0,400));
};
