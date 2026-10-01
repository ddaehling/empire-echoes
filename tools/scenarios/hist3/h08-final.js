module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1000);
  await page.locator('text=Start the lesson').first().click();
  await page.waitForTimeout(1400);
  // walk until we see a dispute
  let sawDispute=false, sawTension=false;
  for(let i=0;i<40;i++){
    const txt = await page.evaluate(()=>document.body.innerText);
    if(/Weigh it up|WHERE HISTORIANS DISAGREE|Take a side|Ayesha Jalal|John Darwin/.test(txt) && !sawDispute){ sawDispute=true; log('DISPUTE at step '+i); await shot('dispute'); log(txt.slice(0,1800)); }
    if(/Two men, one garden|Tagore/.test(txt) && !sawTension){ sawTension=true; log('TENSION at step '+i); await shot('tension'); }
    const acted = await page.evaluate(()=>{
      const vis=e=>e.offsetParent!==null;
      let r=[...document.querySelectorAll('input[type=radio]:not(:checked), [role=radio][aria-checked=false]')].filter(vis)[0];
      if(r){r.click();return 1;}
      let c=[...document.querySelectorAll('button')].filter(vis).find(e=>/I think that is true|fits|breaks|strains/i.test(e.innerText));
      if(c){c.click();return 2;} return 0;
    });
    if(acted) await page.waitForTimeout(400);
    const moved = await page.evaluate(()=>{const vis=e=>e.offsetParent!==null;
      const b=[...document.querySelectorAll('button,a')].filter(vis).find(e=>/^(next|continue|on →|finish)/i.test(e.innerText.trim()));
      if(b&&!b.disabled){b.click();return 1;} return 0;});
    if(!moved) break;
    await page.waitForTimeout(600);
  }
  log('sawDispute='+sawDispute+' sawTension='+sawTension);
  // COMPARE desync test
  await page.goto('http://localhost:8777/app/');
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{window.BEA.store.act.setYear(1765); window.BEA.store.act.select('british-india');});
  await page.waitForTimeout(900);
  const cmp = await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).find(e=>/compare/i.test(e.innerText)); if(b){b.click();return b.innerText;} return 'no compare';});
  log('compare btn: '+cmp);
  await page.waitForTimeout(1600);
  await shot('compare');
  const years = await page.evaluate(()=>{
    const all=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/^(1[6-9]\d\d|20\d\d)$/.test(e.textContent.trim())).map(e=>e.textContent.trim());
    return {shown:[...new Set(all)], state: window.BEA.store.getState().year};
  });
  log('YEARS ON SCREEN: '+JSON.stringify(years));
};
