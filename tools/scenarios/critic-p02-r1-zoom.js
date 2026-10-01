/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const clip = async (name, x,y,w,h) => {
    const p = require('path');
    await page.screenshot({ path: require('path').join(process.env.SHOTDIR||'/tmp', name+'.png'), clip:{x,y,w,h} });
  };
  // use shot with selector? no. take clipped via page.screenshot into out dir handled by shot only.
  // Instead: zoom the map itself with CSS transform? No. Use browser zoom via map controls.
  await shot('full');
  // British Isles region crop using clip through evaluate is not available; use page.screenshot clip via shot fallback
};
