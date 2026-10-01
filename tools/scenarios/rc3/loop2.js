module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  for (let i=0;i<8;i++){
    const b = await page.evaluate(()=>{ const x=[...document.querySelectorAll('button')].filter(e=>e.offsetParent&&/^(Then|Step it|Cut it|Break|Again|Run it)/i.test(e.innerText.trim())); if(x.length){const t=x[0].innerText.trim(); x[0].click(); return t;} return null; });
    log('press ' + i + ': ' + b);
    if (!b) break;
    await page.waitForTimeout(800);
  }
  await shot('loop-end');
  const p = await page.evaluate(()=>{ const e=[...document.querySelectorAll('*')].filter(x=>/revenue → sepoys/i.test(x.textContent)&&x.textContent.length<7000).pop(); return e?e.innerText:''; });
  log(p.slice(0,3500));
};
