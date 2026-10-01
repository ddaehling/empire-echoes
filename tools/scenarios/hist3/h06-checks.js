module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1200);
  // MAP BAND measurement
  const m = await page.evaluate(()=>{
    const g=s=>{const e=document.querySelector(s); return e?{w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}:null;};
    return {vp:[innerWidth,innerHeight], map:g('[data-mount=map]')||g('.map-band')||g('#map'), svg:g('svg')};
  });
  log('BUDGET '+JSON.stringify(m));
  // legend accessible names
  const leg = await page.evaluate(()=>[...document.querySelectorAll('[data-mount=legend] *, .legend *')].filter(e=>e.getAttribute('aria-label')||e.title).map(e=>(e.getAttribute('aria-label')||e.title)).slice(0,20));
  log('LEGEND ARIA: '+JSON.stringify(leg));
  const legTxt = await page.evaluate(()=>{const e=document.querySelector('[data-mount=legend]')||document.querySelector('.legend'); return e?e.innerText.replace(/\n/g,' | '):'none';});
  log('LEGEND TEXT: '+legTxt);
  // Full a11y-ish: any element whose accessible name contains 'deg'
  const degs = await page.evaluate(()=>[...document.querySelectorAll('*')].map(e=>e.getAttribute('aria-label')).filter(x=>x&&/deg\b|°/.test(x)).slice(0,10));
  log('DEG LEAKS: '+JSON.stringify(degs));
  // through-line cloze presence
  const cloze = await page.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>/It started as/.test(x.textContent)&&x.children.length<40); return e?e.innerText.replace(/\s+/g,' '):'MISSING';});
  log('CLOZE: '+cloze);
  await shot('desktop');
};
