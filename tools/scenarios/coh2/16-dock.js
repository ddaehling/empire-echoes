module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(()=>window.BEA.store.dispatch('select','kenya'));
  await page.waitForTimeout(1600);
  log(JSON.stringify(await page.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),sh:e.scrollHeight};};
    const f=document.querySelector('.map__furniture');
    return {stage:r('#stage'), map:r('.map'), frame:r('.map__frame'), furn:r('.map__furniture'), dock:f&&f.dataset.dock, mode:f&&f.dataset.railmode, rail:r('.map__rail'), sw:r('.map__switch'), ctrls:r('.map__controls'), fit: window.BEA.registry ? null : null};
  })));
};
