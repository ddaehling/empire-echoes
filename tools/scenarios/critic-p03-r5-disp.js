/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{location.hash='#year=1900';}); await page.waitForTimeout(800);
  const chip = await page.$('.tl__warn');
  log('chip text: '+(chip? await chip.innerText() : 'none'));
  await chip.click(); await page.waitForTimeout(800);
  await shot('disputed-1900');
  const txt = await page.evaluate(()=>{
    const d = document.querySelector('.tl__sheet, .tl__drawer, .tl__pop, [class*=sheet], [class*=drawer]');
    return d ? d.innerText.slice(0,2500) : document.querySelector('#timebar').innerText.slice(-2500);
  });
  log('drawer:\n'+txt);
  // count marks with contested/circa treatment
  const marks = await page.evaluate(()=>{
    const ms = Array.from(document.querySelectorAll('.tl-mark'));
    return { n: ms.length, sample: ms.slice(0,6).map(m=>m.className+' | '+(m.getAttribute('aria-label')||'').slice(0,140)) };
  });
  log('marks: '+JSON.stringify(marks,null,1));
  const contested = await page.evaluate(()=>{
    const q = Array.from(document.querySelectorAll('[class*=contested], .num--contested, [class*=circa]'));
    return q.slice(0,10).map(e=>e.tagName+'.'+e.className+' | '+e.innerText.slice(0,60));
  });
  log('contested-marked elements: '+JSON.stringify(contested,null,1));
};
