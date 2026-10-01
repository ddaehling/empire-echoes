/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const root = document.querySelector('[class^="tl-"], .tl');
    const out = {};
    out.classes = [...new Set([...document.querySelectorAll('[class*="tl-"]')].map(n=>String(n.className.baseVal!==undefined?n.className.baseVal:n.className).split(' ').filter(c=>c.startsWith('tl-')).join(' ')))].slice(0,80);
    return out;
  });
  log('classes:', JSON.stringify(info.classes));
  // the number row above ticks
  const nums = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[class*="tl-ax"] *')].filter(n=>n.children.length===0 && n.textContent.trim());
    return els.slice(0,60).map(n=>({c:String(n.className.baseVal!==undefined?n.className.baseVal:n.className), t:n.textContent.trim(), title:n.getAttribute('title')||n.getAttribute('aria-label')}));
  });
  log('axis leaves:', JSON.stringify(nums).slice(0,4000));
  await shot('axisfull');
  await shot('axis', '.tl-ax');
};
