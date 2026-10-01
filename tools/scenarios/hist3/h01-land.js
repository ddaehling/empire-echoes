module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  page.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  log('TEXT:', (await page.evaluate(()=>document.body.innerText)).slice(0,4000));
  log('ERRORS:', JSON.stringify(errs));
};
