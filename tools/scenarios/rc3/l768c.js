module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6&filter=stage:working,pressure:off');
  await page.waitForTimeout(2600);
  await page.evaluate(()=>{ const s=document.querySelector('.tr-panel__scroll'); if(s) s.scrollTop=260; });
  await page.waitForTimeout(500);
  await shot('progscroll');
  log('svg ' + JSON.stringify(await page.evaluate(()=>{const s=[...document.querySelectorAll('svg')].find(x=>/Revenue/.test(x.textContent)); const r=s.getBoundingClientRect(); return {t:Math.round(r.y),b:Math.round(r.bottom)};})));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(e=>/MORE OF THIS BEAT/i.test(e.innerText)); if(b) b.click(); });
  await page.waitForTimeout(900);
  await shot('more');
  log('after more: svg ' + JSON.stringify(await page.evaluate(()=>{const s=[...document.querySelectorAll('svg')].find(x=>/Revenue/.test(x.textContent)); if(!s)return null; const r=s.getBoundingClientRect(); return {t:Math.round(r.y),b:Math.round(r.bottom)};})));
};
