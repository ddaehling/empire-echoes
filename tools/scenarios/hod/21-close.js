module.exports = async ({ page, shot, log }) => {
  const T = process.env.HOD_TOUR || 'lesson-one';
  await page.goto(page.url().split('#')[0] + '#tour='+T+'&step=9', { waitUntil:'load' });
  await page.waitForTimeout(12000);
  await shot('last-'+T);
  // press Next / Finish to reach the Close
  for (let i=0;i<3;i++){
    const did = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/^(next|finish|the end|close)/i.test(x.innerText.trim()));
      if(b&&!b.disabled){b.click();return b.innerText.trim();} return null;});
    log('pressed '+did);
    await page.waitForTimeout(3000);
    if(!did) break;
  }
  await shot('close-'+T);
  log('=== CLOSE TEXT ===');
  log((await page.evaluate(()=>document.body.innerText)).slice(0,6000));
};
