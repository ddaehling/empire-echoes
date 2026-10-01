module.exports = async ({ page, shot, log }) => {
  const state = async (t) => {
    const s = await page.evaluate(()=>({
      hash: location.hash.slice(0,70),
      ovX: document.documentElement.scrollWidth - window.innerWidth,
      focus: (document.activeElement && ((document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||document.activeElement.tagName)+'').replace(/\s+/g,' ').slice(0,48)),
    }));
    log(t + ' :: ' + JSON.stringify(s));
  };
  await page.waitForTimeout(2500);
  // KEYBOARD ONLY: tab into the lesson
  let found = null;
  for (let i=0;i<40;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>((document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||'')+'').replace(/\s+/g,' ').trim().slice(0,50));
    if (i<25) log('tab'+i+': ' + f);
    if (/Start the lesson/i.test(f)) { found = i; break; }
  }
  log('start-lesson reachable by tab at index ' + found);
  if (found !== null) { await page.keyboard.press('Enter'); await page.waitForTimeout(1600); }
  await state('after enter');
  await shot('kb-beat1');
  // keyboard advance through beats
  for (let i=0;i<3;i++){
    const ok = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>/^Next beat$/i.test(e.getAttribute('aria-label')||'')); if(b){b.focus(); return true;} return false; });
    if(!ok){log('no next at iter '+i);break;}
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    await state('kb next ' + i);
  }
  await shot('kb-after');
  // ESCAPE
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); await state('after escape');
  // RAPID SCRUB
  await page.goto('http://localhost:8777/app/#year=1600'); await page.waitForTimeout(2000);
  for (let i=0;i<60;i++){ await page.keyboard.press('ArrowRight'); }
  await page.waitForTimeout(1500); await state('after 60 rapid keys');
  await shot('scrub');
  // BACK button
  await page.goBack(); await page.waitForTimeout(1200); await state('after back');
  await page.goBack(); await page.waitForTimeout(1200); await state('after back2');
  // RETURN VISIT (same context, reload)
  await page.goto('http://localhost:8777/app/'); await page.waitForTimeout(2500); await state('return visit');
  await shot('return');
  log('RETURN TEXT ' + (await page.evaluate(()=>document.body.innerText)).slice(0,700));
};
