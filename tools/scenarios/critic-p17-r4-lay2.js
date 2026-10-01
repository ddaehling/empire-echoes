/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const h of ['#layer=zzzz','#layer=pressure','#layer=informal']) {
    await page.goto('http://localhost:8777/app/'+h, {waitUntil:'load'});
    await page.waitForTimeout(2500);
    const t = await page.evaluate(()=>({byline:document.querySelector('.byline')?.innerText.replace(/\s+/g,' ').slice(0,260),
      legend: document.querySelector('.legend')?.innerText.replace(/\s+/g,' ').slice(0,200),
      err: Array.from(document.querySelectorAll('body *')).filter(e=>/Reload the atlas/.test(e.innerText||'')&&e.children.length<6).map(e=>e.innerText.replace(/\s+/g,' ').slice(0,200))[0]||null}));
    log(h + ' :: ' + JSON.stringify(t));
    await shot('lay-'+h.replace(/\W+/g,'_'));
  }
};
