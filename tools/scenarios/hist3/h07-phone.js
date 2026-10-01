module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1400);
  await shot('phone-landing');
  const has = s => page.evaluate(t=>document.body.innerText.includes(t), s);
  log('cloze on landing: '+ await has('It started as'));
  await page.locator('text=Start the lesson').first().click();
  await page.waitForTimeout(1600);
  await shot('phone-beat1');
  const m = await page.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s); if(!e)return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)};};
    return {map:r('[data-mount=map]'), zoom:r('[data-mount=map] .zoom, .map-zoom, [class*=zoom]'), transport:r('[data-mount=transport], [class*=transport]')};
  });
  log('BEAT GEOM: '+JSON.stringify(m));
  log('cloze in beat: '+ await has('It started as'));
  // advance a few beats
  for(let i=0;i<3;i++){
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].filter(e=>e.offsetParent).find(e=>/^next/i.test(e.innerText.trim())); if(b)b.click();});
    await page.waitForTimeout(900);
  }
  await shot('phone-beat4');
  log('TEXT: '+(await page.evaluate(()=>document.body.innerText)).slice(0,1500));
};
