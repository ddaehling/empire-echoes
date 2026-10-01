/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'clientHeight').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(600);
  const L = '[data-mount="legend"]';
  const S = '.legend__bodywrap';
  const info = await page.evaluate((s)=>{const e=document.querySelector(s); return {ch:e.clientHeight, sh:e.scrollHeight};}, S);
  log('bodywrap: '+JSON.stringify(info));
  const swHTML = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('.legend__entry')].slice(0,3);
    return rows.map(r=>{const s=r.querySelector('.sym'); const cs=getComputedStyle(s); const bef=getComputedStyle(s,'::before');
      return {word:(r.querySelector('.legend__word')||{}).innerText, html:s.outerHTML.slice(0,220), bg:cs.backgroundColor, bgImg:cs.backgroundImage.slice(0,80), beforeBg:bef.backgroundImage.slice(0,80), tex:s.dataset.tex};});
  });
  log('SWATCH: '+JSON.stringify(swHTML,null,1));
  for (let i=1;i<=8;i++){
    const more = await page.evaluate((s)=>{const e=document.querySelector(s); const b=e.scrollTop; e.scrollTop += e.clientHeight-30; return e.scrollTop>b;}, S);
    await page.waitForTimeout(350);
    await shot('key'+i, L);
    if(!more) break;
  }
};
