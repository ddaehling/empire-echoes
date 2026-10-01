module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  const all = await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+20 && e.clientHeight>100).map(e=>({cls:(e.className+'').slice(0,50), ch:e.clientHeight, sh:e.scrollHeight})));
  log('scrollers: ' + JSON.stringify(all));
  await page.mouse.move(384, 900);
  for (let i=0;i<6;i++){ await page.mouse.wheel(0, 120); await page.waitForTimeout(200); }
  await page.waitForTimeout(600);
  await shot('wheeled');
  const b = await page.evaluate(()=>{ const svg=[...document.querySelectorAll('svg')].find(s=>/Revenue/.test(s.textContent)); const r=svg.getBoundingClientRect(); return {top:Math.round(r.y),bot:Math.round(r.bottom)}; });
  log('svg now ' + JSON.stringify(b));
};
