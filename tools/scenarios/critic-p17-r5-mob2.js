/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Cannot read properties of null (reading 'x').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3500);
  const b = await page.evaluate(() => { const m=[...document.querySelectorAll('button,a')].find(e=>/THE COLOUR KEY/i.test(e.innerText)); if(!m)return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  log('BTN '+JSON.stringify(b));
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1400);
  await shot('01-key');
  const st = await page.evaluate(()=>{
    const m=document.querySelector('.map__plate')||document.querySelector('svg');
    const r=m?m.getBoundingClientRect():null;
    const k=[...document.querySelectorAll('*')].find(e=>/^How to read this map/.test((e.innerText||'').trim()));
    const kr=k?k.getBoundingClientRect():null;
    return {map:r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null,
            key:kr?{x:Math.round(kr.x),y:Math.round(kr.y),w:Math.round(kr.width),h:Math.round(kr.height)}:null,
            cols:[...document.querySelectorAll('[class*="lplate__col"]')].map(e=>{const q=e.getBoundingClientRect();return{c:e.className,x:Math.round(q.x),y:Math.round(q.y),w:Math.round(q.width),h:Math.round(q.height),sh:e.scrollHeight};})};
  });
  log('STATE '+JSON.stringify(st,null,1));
  await page.mouse.move(195,600);
  for(let i=0;i<8;i++){ await page.mouse.wheel(0,600); await page.waitForTimeout(200); }
  await shot('02-key-scrolled');
  // escape
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  await shot('03-after-esc');
  log('ERR '+JSON.stringify(errs));
};
