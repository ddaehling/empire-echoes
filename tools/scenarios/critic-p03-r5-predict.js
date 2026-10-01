/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.click('.tl-rate__ask'); await page.waitForTimeout(800);
  await shot('predict-1');
  log('after ask: '+await page.evaluate(()=>document.querySelector('.tl-rate').innerText.replace(/\n{2,}/g,'\n').slice(0,1500)));
  // find inputs
  const f = await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-rate input, .tl-rate button')).map(e=>e.tagName+'.'+e.className+' | '+(e.value||e.innerText||'').slice(0,40)));
  log('controls: '+JSON.stringify(f,null,1));
  const inp = await page.$('.tl-rate input');
  if (inp){ await inp.fill('1815'); await page.waitForTimeout(200);
    const sub = await page.$('.tl-rate button[type=submit], .tl-rate__commit, .tl-rate form button');
    if (sub) { await sub.click(); } else { await inp.press('Enter'); }
    await page.waitForTimeout(1000); await shot('predict-2');
    log('after commit: '+await page.evaluate(()=>document.querySelector('.tl-rate').innerText.replace(/\n{2,}/g,'\n').slice(0,1500)));
  }
};
