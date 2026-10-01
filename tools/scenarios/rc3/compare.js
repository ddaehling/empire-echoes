module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=3&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400);
  const years = async (tag) => {
    const o = await page.evaluate(() => {
      const t = document.body.innerText;
      const yrs = [...t.matchAll(/\b1[5-9]\d\d\b|\b20[0-2]\d\b/g)].map(m=>m[0]);
      return {
        url: location.hash,
        clock: (document.querySelector('.tl__year, [class*="year"]')||{}).innerText,
        head: (document.querySelector('.cx-lede, [class*="lede"]')||{}).innerText,
        cmp: (document.querySelector('[class*="cmp"], [class*="compare"]')||{innerText:''}).innerText.slice(0,400)
      };
    });
    log(tag + ' :: ' + JSON.stringify(o));
  };
  await years('BEFORE');
  // open compare
  const opened = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(e=>/compare|side by side|two years/i.test((e.getAttribute('aria-label')||e.innerText)));
    if(b){b.click();return (b.getAttribute('aria-label')||b.innerText).slice(0,60);} 
    // via Tools
    const t=[...document.querySelectorAll('button')].find(e=>/^Tools/i.test(e.innerText)); if(t){t.click();}
    return 'tools';
  });
  log('opened: ' + opened);
  await page.waitForTimeout(1200);
  const opened2 = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].find(e=>/compare/i.test((e.getAttribute('aria-label')||e.innerText)));
    if(b){b.click();return (b.getAttribute('aria-label')||b.innerText).slice(0,60);} return 'none';
  });
  log('opened2: ' + opened2);
  await page.waitForTimeout(1800);
  await shot('compare-in-beat');
  await years('AFTER');
  log('TEXT>>>' + (await page.evaluate(()=>document.body.innerText)).slice(0,2500));
};
