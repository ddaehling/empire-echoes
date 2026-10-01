/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.click('.tl-rate__ask'); await page.waitForTimeout(900);
  await shot('pred-open');
  log('pred: '+await page.evaluate(()=>{const p=document.querySelector('.tl-pred'); return p?p.innerText.replace(/\n{2,}/g,'\n'):'NO .tl-pred';}));
  const inp = await page.$('.tl-pred__year');
  if (inp) {
    await inp.fill('1815');
    await page.click('.tl-pred__go'); await page.waitForTimeout(1000);
    await shot('pred-answer1');
    log('after q1: '+await page.evaluate(()=>document.querySelector('.tl-pred').innerText.replace(/\n{2,}/g,'\n')));
    const b = await page.$$('.tl-pred button');
    log('buttons now: '+JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-pred button')).map(x=>x.innerText.slice(0,40)))));
    // answer q2
    const q2 = await page.$('.tl-pred__band, .tl-pred button');
    const bandBtns = await page.$$('.tl-pred__band');
    if (bandBtns.length) { await bandBtns[2].click(); await page.waitForTimeout(900); await shot('pred-answer2');
      log('after q2: '+await page.evaluate(()=>document.querySelector('.tl-pred').innerText.replace(/\n{2,}/g,'\n'))); }
  }
};
