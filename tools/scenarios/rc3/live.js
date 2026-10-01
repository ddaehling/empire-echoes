module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const lr = await page.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map(e=>({live:e.getAttribute('aria-live')||e.getAttribute('role'), txt:(e.innerText||'').slice(0,120)})));
  log('LIVE REGIONS: ' + JSON.stringify(lr));
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Start the lesson/i.test(e.innerText)); b.click();});
  await page.waitForTimeout(1600);
  log('after start: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>(e.innerText||'').slice(0,140)))));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>/^Next beat$/i.test(e.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(1400);
  log('after next: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>(e.innerText||'').slice(0,140)))));
  // heading structure
  log('HEADINGS: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.offsetParent).map(e=>e.tagName+':'+e.innerText.replace(/\s+/g,' ').slice(0,44)))));
  // landmark check
  log('LANDMARKS: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('main,nav,aside,header,footer,[role]')].filter(e=>e.offsetParent).map(e=>e.tagName+'/'+(e.getAttribute('role')||'')).slice(0,25))));
};
