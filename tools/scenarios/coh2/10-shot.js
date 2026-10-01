module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600); await shot('base');
  await page.evaluate(()=>window.BEA.store.dispatch('select','kenya')); await page.waitForTimeout(1400); await shot('sel');
  log('geom', JSON.stringify(await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)];};return {stage:r('#stage'),plate:r('.map__frame'),tl:r('[data-mount=timeline]'),note:r('.stage__note'),legend:r('.stage__legend'),vh:innerHeight};})));
};
