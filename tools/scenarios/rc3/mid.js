module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  const m = await page.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s); if(!e)return null; const b=e.getBoundingClientRect(); return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)];};
    return { win:[innerWidth,innerHeight], stageMap:r('.stage__map'), canvas:r('canvas'), plate:r('.map__plate'),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      overflowY: document.documentElement.scrollHeight - innerHeight };
  });
  log(JSON.stringify(m));
  await shot('mid');
};
