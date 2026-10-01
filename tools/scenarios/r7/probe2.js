module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PE '+e.message)); page.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text());});
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india',{waitUntil:'load'});
  await page.waitForTimeout(3800);
  await shot('dossier');
  log('DOSSIER: '+await page.evaluate(()=>{const d=document.querySelector('.cx-sheet, .dsr, [class*=dsr]'); return d?d.innerText.replace(/\s+/g,' ').slice(0,1200):'none';}));
  // projection + silences keys
  await page.keyboard.press('p'); await page.waitForTimeout(1200); await shot('proj');
  await page.keyboard.press('p'); await page.waitForTimeout(800);
  await page.keyboard.press('h'); await page.waitForTimeout(1400); await shot('silences');
  log('AFTER H: '+await page.evaluate(()=>{const l=document.querySelector('.stage__key, .legend');return l?l.innerText.replace(/\s+/g,' ').slice(0,320):'none';}));
  await page.keyboard.press('h'); await page.waitForTimeout(600);
  await page.keyboard.press('w'); await page.waitForTimeout(1400); await shot('weight');
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  // teacher desk
  const td=await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/teaching desk/i.test(x.innerText)); if(b){b.click();return 'opened';}return 'none';});
  log('TEACHER '+td); await page.waitForTimeout(1800); await shot('teacher');
  log('TEACHER PANEL: '+await page.evaluate(()=>{const d=document.querySelector('[class*=tp-]'); return d?d.innerText.replace(/\s+/g,' ').slice(0,900):'none';}));
  log('ERR '+JSON.stringify(errs));
};
