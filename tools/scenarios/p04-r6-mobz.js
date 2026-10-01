/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  log(JSON.stringify(await page.evaluate(() => {
    const r = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), z: getComputedStyle(n).zIndex, pos: getComputedStyle(n).position }; };
    const head = document.querySelector('.dsr__head').getBoundingClientRect();
    const at = document.elementFromPoint(30, Math.round(head.top) + 6);
    return {
      stage: r('.app__stage'), dossier: r('.app__dossier'), sheet: r('.app__sheet'),
      map: r('.stage__map'), enlarged: r('.map.is-enlarged') || r('.map'),
      headTop: Math.round(head.top),
      whatIsOnTopOfTheHead: at ? at.className + ' <' + at.tagName + '>' : null,
    };
  }), null, 1));
};
