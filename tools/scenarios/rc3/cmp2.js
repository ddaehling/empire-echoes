module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=3&filter=stage:working,pressure:off');
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{ const t=[...document.querySelectorAll('button')].find(e=>/^Tools/.test(e.innerText)); if(t)t.click(); });
  await page.waitForTimeout(900);
  await shot('tools-open');
  log('tools text: ' + (await page.evaluate(()=>{const d=[...document.querySelectorAll('[class*="tools"],[role=menu],[class*="sheet"]')].map(e=>e.innerText).filter(t=>t&&t.length>30); return d.join(' ||| ').slice(0,1200);})));
  const r = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent&&/compare/i.test(e.getAttribute('aria-label')||e.innerText)); if(b.length){b[0].click(); return b.map(x=>(x.getAttribute('aria-label')||x.innerText).slice(0,50));} return []; });
  log('compare buttons ' + JSON.stringify(r));
  await page.waitForTimeout(2000);
  await shot('compare-open');
  const st = await page.evaluate(()=>({hash:location.hash, txt: document.body.innerText.slice(0,1400)}));
  log(st.hash); log(st.txt);
};
