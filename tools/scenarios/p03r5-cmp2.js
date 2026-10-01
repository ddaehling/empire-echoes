/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(''+e));
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1913&compare=1914'; });
  await page.waitForTimeout(700);
  log('ghost shown:', await page.evaluate(() => { const g=document.querySelector('.tl-ax__ghost'); const b=document.querySelector('.tl-ax__ghost-lbl'); const r=b.getBoundingClientRect(); return !g.hidden + ' label=' + b.getAttribute('aria-label') + ' box=' + Math.round(r.width) + 'x' + Math.round(r.height); }));
  await page.click('.tl-ax__ghost-lbl');
  await page.waitForTimeout(700);
  log('after pressing the ghost:', await page.evaluate(() => JSON.stringify({ cy: document.querySelector('.tl').__p03.store.getState().compareYear, ghost: !document.querySelector('.tl-ax__ghost').hidden, hash: location.hash })));
  log('errors:', JSON.stringify(errs));
};
