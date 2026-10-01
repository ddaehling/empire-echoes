module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(10000);
  await page.evaluate(()=>{
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('style','position:fixed;width:0;height:0');
    svg.innerHTML = '<filter id="protan"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0"/></filter>';
    document.body.appendChild(svg);
    document.documentElement.style.filter='url(#protan)';
  });
  await page.waitForTimeout(1200);
  await shot('protanopia');
  await page.evaluate(()=>{document.documentElement.style.filter='';});
  // swatch fills
  const sw = await page.evaluate(()=>[...document.querySelectorAll('.legend__sw, [class*=swatch], .legend__i')].slice(0,14).map(e=>{
    const cs=getComputedStyle(e); return {t:(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,30), bg:cs.backgroundColor, img:cs.backgroundImage.slice(0,50)};
  }));
  log('SWATCHES '+JSON.stringify(sw,null,1));
};
