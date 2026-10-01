module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1891&sel=southern-rhodesia&tour=core&step=9&filter=stage:working,pressure:off&view=4,0.0829,0.0811');
  await page.waitForTimeout(2500);
  const ta = page.locator('textarea').first();
  await ta.scrollIntoViewIfNeeded();
  await shot('field-view');
  const box = await ta.evaluate(el => { let p = el.closest('section,form,div[class]'); for(let i=0;i<4&&p;i++){ if(p.innerText.length>200) break; p=p.parentElement;} return p.innerText.slice(0,3000); });
  log(box);
};
