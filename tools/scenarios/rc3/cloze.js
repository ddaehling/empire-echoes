module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900');
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(e=>/Read it whole/i.test(e.innerText)); if(b)b.click();});
  await page.waitForTimeout(1500);
  await shot('readitwhole');
  log('WHOLE >>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,3000));
};
