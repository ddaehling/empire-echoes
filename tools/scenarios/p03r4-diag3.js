/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(2000);
  log('fresh load, no interaction:', await page.evaluate(() => JSON.stringify({
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    app: Math.round(document.querySelector('#app').getBoundingClientRect().width),
    dossier: Math.round(document.querySelector('.app__dossier').getBoundingClientRect().width),
    dossierAttr: document.querySelector('#app').dataset.dossier,
    tl: Math.round((document.querySelector('.tl')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width),
    stage: Math.round(document.querySelector('#stage').getBoundingClientRect().height),
    dsrName: (document.querySelector('.dsr__name')||{}).textContent,
    dsrNameW: Math.round((document.querySelector('.dsr__name')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width),
  })));
};
