/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('style', 'position:fixed;width:0;height:0');
    const mk = (id, m) => { const f = document.createElementNS(ns,'filter'); f.id=id;
      const cm = document.createElementNS(ns,'feColorMatrix'); cm.setAttribute('type','matrix'); cm.setAttribute('values', m); f.appendChild(cm); svg.appendChild(f); };
    mk('prot','0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0');
    mk('deut','0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0');
    mk('trit','0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0');
    document.body.appendChild(svg);
  });
  for (const f of ['prot','deut','trit']) {
    await page.evaluate((id) => { document.querySelector('.legend').style.filter = `url(#${id})`; }, f);
    await page.waitForTimeout(250);
    await shot('cvd-' + f, '.legend');
  }
};
