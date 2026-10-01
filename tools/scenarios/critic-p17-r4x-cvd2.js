/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const M = {
  protanopia: [0.567,0.433,0,0,0, 0.558,0.442,0,0,0, 0,0.242,0.758,0,0, 0,0,0,1,0],
  deuteranopia: [0.625,0.375,0,0,0, 0.7,0.3,0,0,0, 0,0.3,0.7,0,0, 0,0,0,1,0],
  tritanopia: [0.95,0.05,0,0,0, 0,0.433,0.567,0,0, 0,0.475,0.525,0,0, 0,0,0,1,0],
  grayscale: [0.2126,0.7152,0.0722,0,0, 0.2126,0.7152,0.0722,0,0, 0.2126,0.7152,0.0722,0,0, 0,0,0,1,0],
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1400);
  await page.evaluate((MM) => {
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg'); svg.setAttribute('width','0'); svg.setAttribute('height','0');
    svg.style.position='absolute';
    for (const [k,v] of Object.entries(MM)) {
      const f=document.createElementNS(ns,'filter'); f.id='cvd-'+k;
      f.setAttribute('color-interpolation-filters','sRGB');
      const m=document.createElementNS(ns,'feColorMatrix'); m.setAttribute('type','matrix'); m.setAttribute('values', v.join(' '));
      f.appendChild(m); svg.appendChild(f);
    }
    document.body.appendChild(svg);
    window.__cvd = k => { const el=document.querySelector('.app__overlay'); el.style.filter = k? `url(#cvd-${k})` : ''; };
  }, M);
  await shot('cvd-normal', '.app__overlay');
  for (const k of Object.keys(M)) {
    await page.evaluate(kk => window.__cvd(kk), k);
    await page.waitForTimeout(500);
    await shot('cvd-' + k, '.app__overlay');
  }
};
