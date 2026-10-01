module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await page.goto('http://localhost:8777/app/#tour=core&step=12',{waitUntil:'load'});
  await page.waitForTimeout(3800);
  await shot('a-arrive');
  log('RAIL: '+(await page.evaluate(()=>{const r=document.querySelector('.qz')||document.querySelector('.tr-panel');return r?r.innerText.replace(/\s+/g,' ').slice(0,600):'none';})));
  // commit an answer
  const r1 = await page.evaluate(()=>{
    const o=document.querySelector('.qz-opt, .qz input[type=radio], .qz-check__o input');
    if(o){ o.click(); return 'picked'; }
    return 'no-opt';
  });
  log('PICK '+r1);
  await page.waitForTimeout(500);
  const r2 = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^commit/i.test(x.innerText.trim())&&!x.disabled);
    if(b){b.click();return 'commit';} return 'no-commit';
  });
  log('COMMIT '+r2);
  await page.waitForTimeout(1600);
  await shot('b-after-commit');
  log('AFTER: '+(await page.evaluate(()=>{const r=document.querySelector('.qz')||document.querySelector('.tr-panel');return r?r.innerText.replace(/\s+/g,' ').slice(0,900):'none';})));
  // go back to the beat
  const r3 = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].find(x=>/back to the beat|back to the lesson/i.test(x.innerText||''));
    if(b){b.click();return b.innerText.trim();} return null;
  });
  log('BACKTOBEAT '+r3);
  await page.waitForTimeout(1600);
  await shot('c-back');
  log('PANEL NOW: '+(await page.evaluate(()=>{const r=document.querySelector('.tr-panel');return r?r.innerText.replace(/\s+/g,' ').slice(0,900):'none';})));
  log('SORT ROWS: '+(await page.evaluate(()=>document.querySelectorAll('.tr-sort__row').length)));
  log('ERR '+JSON.stringify(errs));
};
