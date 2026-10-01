module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(()=>window.BEA.store.dispatch('select','kenya'));
  await page.waitForTimeout(1600);
  log(JSON.stringify(await page.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return {w:Math.round(e.getBoundingClientRect().width), flex:c.flex, minW:c.minInlineSize, dir:c.flexDirection, pos:c.position, ow:c.overflow};};
    return {rail:g('.map__rail'), sw:g('.map__switch'), head:g('.map__switchhead'), defs:g('.map__defs'), ctrls:g('.map__controls'), modes:g('.map__modes')};
  }), null, 1));
};
