/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path = require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // Inject a wrapper div to allow element screenshots of arbitrary regions
  const crop = async (name, x, y, w, h) => {
    await page.evaluate(([x,y,w,h]) => {
      let d = document.getElementById('__crop');
      if (!d) { d = document.createElement('div'); d.id='__crop'; d.style.position='fixed'; d.style.pointerEvents='none'; d.style.zIndex='-1'; document.body.appendChild(d); }
      d.style.left=x+'px'; d.style.top=y+'px'; d.style.width=w+'px'; d.style.height=h+'px';
    }, [x,y,w,h]);
    await shot(name, '#__crop');
  };
  await crop('brit-isles', 620, 150, 220, 180);
  await crop('north-america', 100, 100, 480, 320);
  await crop('india', 900, 250, 320, 260);
  await crop('africa-south', 680, 480, 320, 300);
  await crop('caribbean', 330, 300, 300, 240);
  await crop('legend-panel', 1060, 60, 380, 560);
};
