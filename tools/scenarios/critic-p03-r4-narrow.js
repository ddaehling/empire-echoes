/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const w of [320, 360, 375, 390, 430]) {
    await page.setViewportSize({ width: w, height: 780 });
    await page.evaluate(() => { location.hash = '#year=1765'; });
    await page.waitForTimeout(900);
    const g = await page.evaluate(() => {
      const t = document.querySelector('.tl__track');
      const cards = [...document.querySelectorAll('.tl-chg')].filter(n=>n.offsetParent);
      const body = document.body.innerText;
      return { trackW: t?.clientWidth, trackH: Math.round(t?.getBoundingClientRect().height||0), cards: cards.length, hasSummary: /things dated/.test(body), spineOk: !!document.querySelector('.tl-spine__caption') };
    });
    log(w + 'px: ' + JSON.stringify(g));
    await shot('w' + w);
  }
};
