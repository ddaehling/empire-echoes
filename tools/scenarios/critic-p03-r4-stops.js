/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1834'; });
  await page.waitForTimeout(800);
  // speed 4x to reach 1838 quickly
  await page.selectOption('.tl-speed', '4').catch(async()=>{ await page.evaluate(()=>{const s=document.querySelector('.tl-speed'); s.value='4'; s.dispatchEvent(new Event('change',{bubbles:true}));}); });
  await page.click('.tl-btn--play');
  const seen = [];
  for (let i=0;i<28;i++){
    await page.waitForTimeout(400);
    const s = await page.evaluate(() => ({ y: (location.hash.match(/year=(\d+)/)||[])[1], play: document.querySelector('.tl-btn--play')?.innerText.trim(), stop: document.querySelector('.tl-stop, [class*="stop"]')?.innerText?.replace(/\n/g,' | ').slice(0,220) }));
    seen.push(JSON.stringify(s));
  }
  log(seen.join('\n'));
  await shot('stopped');
  log('final body tail:', await page.evaluate(()=>document.body.innerText.slice(0,50)));
};
