module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  const pos = await page.evaluate(()=>{const s=document.querySelector('.tr-panel__scroll'); const r=s.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height-30), st:s.scrollTop};});
  log('panel ' + JSON.stringify(pos));
  await page.mouse.move(pos.x, pos.y);
  for (let i=0;i<5;i++){ await page.mouse.wheel(0,150); await page.waitForTimeout(150); }
  await page.waitForTimeout(500);
  log('scrollTop after wheel over prose: ' + await page.evaluate(()=>document.querySelector('.tr-panel__scroll').scrollTop));
  const svgc = await page.evaluate(()=>{const s=[...document.querySelectorAll('svg')].find(x=>/Revenue/.test(x.textContent)); const r=s.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)};});
  await page.mouse.move(svgc.x, svgc.y);
  for (let i=0;i<3;i++){ await page.mouse.wheel(0,150); await page.waitForTimeout(150); }
  log('scrollTop after wheel over svg: ' + await page.evaluate(()=>document.querySelector('.tr-panel__scroll').scrollTop));
};
