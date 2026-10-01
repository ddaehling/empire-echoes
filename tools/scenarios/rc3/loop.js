module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  await shot('loop-0');
  const el = await page.$('[class*="mech"], svg[class*="loop"]');
  if (el) { await el.screenshot({path:'/tmp/rc3-loop/zoom.png'}); log('elshot'); }
  // step it
  for (let i=0;i<4;i++){
    const ok = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>e.offsetParent&&/^Step it|^Next step|^Step →/i.test(e.innerText.trim())); if(b){b.click();return b.innerText.trim();} return null; });
    log('step ' + i + ' -> ' + ok);
    await page.waitForTimeout(900);
    await shot('loop-'+(i+1));
  }
  const cut = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>e.offsetParent&&/cut|break|remove/i.test(e.innerText)); if(b){b.click();return b.innerText.trim();} return null; });
  log('cut -> ' + cut);
  await page.waitForTimeout(1200);
  await shot('loop-cut');
  log((await page.evaluate(()=>{const p=[...document.querySelectorAll('*')].filter(e=>/revenue → sepoys/i.test(e.textContent)&&e.textContent.length<4000).pop(); return p?p.innerText:'';})).slice(0,2500));
};
