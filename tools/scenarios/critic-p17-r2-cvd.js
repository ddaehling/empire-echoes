/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>{ const b=document.querySelector('#legend-body'); if(b) b.scrollTop=0; });
  await shot('legend-normal', '.stage__legend');
  const filters = {
    protanopia: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
    deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
    tritanopia: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
    grayscale: '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0',
  };
  for (const [name, m] of Object.entries(filters)) {
    await page.evaluate(({name,m}) => {
      document.querySelectorAll('#cvdsvg').forEach(e=>e.remove());
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.id='cvdsvg'; svg.setAttribute('style','position:absolute;width:0;height:0');
      svg.innerHTML = `<filter id="cvd"><feColorMatrix type="matrix" values="${m}"/></filter>`;
      document.body.appendChild(svg);
      document.documentElement.style.filter='url(#cvd)';
    }, {name,m});
    await page.waitForTimeout(300);
    await shot('cvd-'+name, '.stage__legend');
  }
  await page.evaluate(()=>{document.documentElement.style.filter='';});
};
