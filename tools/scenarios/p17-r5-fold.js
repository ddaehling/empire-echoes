/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  page.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await page.waitForTimeout(2800);
  const m = () => page.evaluate(() => {
    const slot = document.querySelector('[data-mount="legend"]');
    const r = slot.getBoundingClientRect();
    return { slot: [Math.round(r.width), Math.round(r.height)], text: slot.innerText.replace(/\s+/g,' ').slice(0,80) };
  });
  log('before ' + JSON.stringify(await m()));
  await page.click('.legend__toggle'); await page.waitForTimeout(600);
  log('folded ' + JSON.stringify(await m()));
  await shot('folded');
  await page.click('.legend__reopen'); await page.waitForTimeout(600);
  log('reopened ' + JSON.stringify(await m()));
  log('ERRORS ' + JSON.stringify(errs));
};
