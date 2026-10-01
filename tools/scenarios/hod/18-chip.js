module.exports = async ({ page, log, shot }) => {
  await page.goto(page.url().split('#')[0] + '#tour=lesson-two&step=4', { waitUntil:'load' });
  await page.waitForTimeout(12000);
  const box = await page.evaluate(()=>{
    const e=document.querySelector('.map__defword'); if(!e) return null;
    const p=e.closest('.map__defchip')||e.parentElement;
    const r=p.getBoundingClientRect(); const cs=getComputedStyle(p); const cs2=getComputedStyle(e);
    return {r:{x:r.x,y:r.y,w:r.width,h:r.height}, parentBg:cs.backgroundColor, parentBgImg:cs.backgroundImage.slice(0,60), color:cs2.color, parentCls:p.className, cs2bg:cs2.backgroundColor};
  });
  log('CHIP '+JSON.stringify(box));
  if(box){ await page.evaluate((b)=>{ const e=document.querySelector('.map__defchip')||document.querySelector('.map__defword'); e.scrollIntoView({block:'center'}); }, box); }
  await page.waitForTimeout(500);
  const clip = box ? {x:Math.max(0,box.r.x-30),y:Math.max(0,box.r.y-30),width:Math.min(400,box.r.w+120),height:Math.min(200,box.r.h+80)} : null;
  await page.screenshot({path: require('path').join(process.env.INSPECT_OUT||'/tmp','chip.png'), clip});
  log('shot at /tmp/chip.png');
};
