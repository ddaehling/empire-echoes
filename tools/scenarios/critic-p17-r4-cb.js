/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.getByText(/Open the full key/i).first().click();
  await page.waitForTimeout(1200);
  const colA = '.lplate__col--a';
  await shot('key-normal', colA);
  // grayscale
  await page.addStyleTag({content:'html{filter:grayscale(1) !important}'});
  await page.waitForTimeout(300); await shot('key-grayscale', colA);
  await page.evaluate(()=>{document.querySelectorAll('style').forEach(s=>{if(s.textContent.includes('grayscale'))s.remove();});});
  // deuteranopia matrix
  await page.addStyleTag({content:`
    svg#cbf{position:fixed;width:0;height:0}
    html{filter:url(#deut) !important}`});
  await page.evaluate(()=>{
    const d=document.createElement('div'); d.innerHTML=`<svg id="cbf"><filter id="deut" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter></svg>`;
    document.body.appendChild(d);
  });
  await page.waitForTimeout(400); await shot('key-deuteranopia', colA);
};
