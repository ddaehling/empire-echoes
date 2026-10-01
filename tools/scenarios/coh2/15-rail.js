module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  log(JSON.stringify(await page.evaluate(()=>{
    const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {y:Math.round(b.y),h:Math.round(b.height),sh:e.scrollHeight,ch:e.clientHeight};};
    return {stage:r('#stage'), rail:r('.map__rail'), sw:r('.map__switch'), head:r('.map__switchhead'), body:r('.map__switchbody'), ctrls:r('.map__controls'), more:r('.map__more'), cls:document.querySelector('.map__switch').className};
  })));
};
