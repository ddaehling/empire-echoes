module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1891&sel=southern-rhodesia&tour=core&step=9&filter=stage:working,pressure:off&view=4,0.0829,0.0811');
  await page.waitForTimeout(2500);
  const tas = page.locator('textarea');
  log('textareas ' + await tas.count());
  for (let i=0;i<await tas.count();i++){
    const vis = await tas.nth(i).isVisible();
    log(' ta'+i+' visible='+vis);
    await tas.nth(i).scrollIntoViewIfNeeded().catch(e=>log('  siv fail'));
    await tas.nth(i).fill('Nature: a treaty concession. Origin: Lobengula 1888. Purpose: to secure mining rights. Cannot tell: what Lobengula was told.').catch(e=>log('  fill fail '+e.message));
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800);
  await shot('after-fill');
  const btns = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent).map(e=>(e.getAttribute('aria-label')||e.innerText).replace(/\s+/g,' ').slice(0,60)));
  log(JSON.stringify(btns.slice(0,20)));
  const t = await page.evaluate(()=>{const p=document.querySelector('[class*="panel"]'); return p? p.innerText.slice(0,2500):'';});
  log(t);
};
