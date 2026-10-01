module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  for (const s of [3,7,14,9]) {
    await page.goto('http://localhost:8777/app/#tour=core&step='+s,{waitUntil:'load'});
    await page.waitForTimeout(3600);
    // click the aux "Count it" in the tour bar
    const c = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/count it/i.test(x.innerText)&&x.offsetParent); if(b){b.click();return b.innerText.trim();} return null;});
    log('STEP '+s+' aux='+JSON.stringify(c));
    await page.waitForTimeout(1800);
    await shot('step'+s);
    log('  RAIL: '+(await page.evaluate(()=>{const r=document.querySelector('.viz')||document.querySelector('.tr-panel');return r?r.innerText.replace(/\s+/g,' ').slice(0,1800):'none';})));
  }
  log('ERR '+JSON.stringify(errs));
};
