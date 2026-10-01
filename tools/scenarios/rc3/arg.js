module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/The argument\s*in full/i.test(e.innerText.replace(/\s+/g,' '))); if(b)b.click();});
  await page.waitForTimeout(2000);
  await shot('argument');
  const t = await page.evaluate(()=>document.body.innerText);
  log('WORDS: ' + t.split(/\s+/).length);
  log(t.slice(0,4000));
};
