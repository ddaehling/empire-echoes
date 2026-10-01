module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1891&sel=southern-rhodesia&tour=core&step=9&filter=stage:working,pressure:off&view=4,0.0829,0.0811');
  await page.waitForTimeout(2500);
  const tas = page.locator('textarea');
  for (let i=0;i<4;i++){
    await tas.nth(i).scrollIntoViewIfNeeded();
    await tas.nth(i).click();
    await tas.nth(i).pressSequentially('A treaty concession obtained from Lobengula in 1888 by Rudd for the BSAC; it cannot tell us what Lobengula was told orally.', {delay: 2});
    await tas.nth(i).blur().catch(()=>{});
    await page.waitForTimeout(400);
    const lbl = await page.evaluate(()=>{const b=document.querySelector('.tr-bar');return b?b.innerText.replace(/\s+/g,' ').slice(0,80):'';});
    log('after ta'+i+': ' + lbl);
  }
  await page.waitForTimeout(1000);
  await shot('unlocked');
  log('BTNS ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.offsetParent).map(e=>(e.getAttribute('aria-label')||e.innerText).replace(/\s+/g,' ').slice(0,50)).slice(0,10))));
  const t = await page.evaluate(()=>document.querySelector('.pane, [class*="panel"]')?.innerText||'');
  log(t.slice(0,1500));
};
