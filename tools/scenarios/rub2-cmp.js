/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', {waitUntil:'load'});
  await page.waitForTimeout(2400);
  // open a dossier too
  await page.keyboard.press('v');
  await page.waitForTimeout(1500);
  await shot('compare-in-beat');
  const info = await page.evaluate(()=>{
    const grab = s => { const e=document.querySelector(s); return e ? (e.innerText||'').replace(/\s+/g,' ').slice(0,200) : null; };
    return {
      hash: location.hash,
      lede: grab('.stage__lede, .cx-lede, [class*="lede"]'),
      tl: grab('.tl__year, [class*="tl-year"], .tl'),
      cmp: grab('.cmp__bar, .cmp'),
      dsr: grab('.dsr__year, .dsr'),
      body: document.body.innerText.slice(0,1500)
    };
  });
  log(JSON.stringify(info,null,1));
};
