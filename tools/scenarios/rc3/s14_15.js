module.exports = async ({ page, shot, log }) => {
  // step 14 dispute
  await page.goto('http://localhost:8777/app/#tour=core&step=14&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/Open the argument|the field/i.test(e.innerText||e.getAttribute('aria-label'))); if(b)b.click();});
  await page.waitForTimeout(1400);
  await shot('s14-open');
  const t = await page.evaluate(()=>{const p=[...document.querySelectorAll('*')].filter(e=>/Jalal|Radcliffe/.test(e.textContent)&&e.textContent.length<9000).pop(); return p?p.innerText:'';});
  log('S14 >>> ' + t.slice(0,3500));
  // step 15 checkpoint
  await page.goto('http://localhost:8777/app/#tour=core&step=15&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/1820 — after the American colonies were lost/i.test(e.innerText)); if(b)b.click();});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>/^Commit$/i.test(e.innerText.trim())); if(b)b.click();});
  await page.waitForTimeout(1200);
  await shot('s15-committed');
  log('S15 >>> ' + (await page.evaluate(()=>document.body.innerText)).slice(0,2600));
};
