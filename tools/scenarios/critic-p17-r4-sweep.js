/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const probe = () => {
    const l = document.querySelector('.legend');
    const st = document.querySelector('.app__stage');
    const groups = document.querySelectorAll('.legend .legend__chip').length;
    const hasColours = /COLOURS/.test(l? l.innerText : '');
    return { stageH: st? Math.round(st.getBoundingClientRect().height):0, groups, hasColours,
      legendH: l? Math.round(l.getBoundingClientRect().height):0 };
  };
  for (const [w,h] of [[1920,1080],[1600,1000],[1440,900],[1366,768],[1280,800],[1280,720],[1024,768]]) {
    await page.setViewportSize({width:w,height:h});
    await page.waitForTimeout(1200);
    log(`${w}x${h} ` + JSON.stringify(await page.evaluate(probe)));
  }
};
