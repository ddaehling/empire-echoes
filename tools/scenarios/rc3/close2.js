module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,a')].find(e=>/Finish here/i.test(e.innerText)); if(b) b.click(); });
  await page.waitForTimeout(2500);
  await shot('close-cold');
  log('URL ' + page.url());
  log('CLOSE>>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,7000));
};
