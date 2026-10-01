/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.keyboard.press('s'); await page.waitForTimeout(1500);
  for (const y of [1900, 1620]) {
    await page.evaluate(yy => { const h=new URLSearchParams(location.hash.slice(1)); h.set('year',yy); location.hash='#'+decodeURIComponent(h.toString()); }, y);
    await page.waitForTimeout(1600);
    const c = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      const big = svgs.sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
      if (!big) return null;
      const stitch = big.querySelectorAll('[class*="stitch"], [data-stitch], g.stitching *');
      const nodes = big.querySelectorAll('circle');
      return { stitchSel: stitch.length, circles: nodes.length,
        classes: [...new Set([...big.querySelectorAll('g')].map(g=>g.getAttribute('class')).filter(Boolean))].slice(0,20) };
    });
    log('year ' + y + ' -> ' + JSON.stringify(c));
    await shot('stitch-' + y);
  }
};
