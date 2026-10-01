module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  const info = await page.evaluate(()=>{
    const svg=[...document.querySelectorAll('svg')].find(s=>/Revenue|revenue/.test(s.textContent)) || document.querySelector('[class*="mech"] svg');
    const sc=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+30 && (e.className+'').includes('cx'));
    const b=svg?svg.getBoundingClientRect():null;
    return {svg: b?{y:Math.round(b.y),h:Math.round(b.height)}:null, scrollers: sc.map(e=>({cls:(e.className+'').slice(0,40), ch:e.clientHeight, sh:e.scrollHeight}))};
  });
  log(JSON.stringify(info));
  // scroll the panel to bring the loop fully into view
  await page.evaluate(()=>{ const sc=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+30 && (e.className+'').includes('cx')); if(sc.length) sc[0].scrollTop += 300; });
  await page.waitForTimeout(600);
  await shot('scrolled300');
  const after = await page.evaluate(()=>{ const svg=[...document.querySelectorAll('svg')].find(s=>/Revenue/.test(s.textContent)); if(!svg) return null; const b=svg.getBoundingClientRect(); const p=svg.closest('[class*="cx"]'); const pb=p?p.getBoundingClientRect():null; return {svgTop:Math.round(b.y), svgBot:Math.round(b.bottom), panelTop: pb?Math.round(pb.y):null, panelBot: pb?Math.round(pb.bottom):null, win: innerHeight}; });
  log('after scroll: ' + JSON.stringify(after));
};
