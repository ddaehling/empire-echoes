/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  for (const [w,h] of [[1280,800],[1440,900],[1680,1050],[1920,1080]]) {
    await page.setViewportSize({width:w,height:h});
    await page.waitForTimeout(1200);
    const d = await page.evaluate(() => {
      const el = document.querySelector('.dossier');
      const r = el.getBoundingClientRect();
      const fur = document.querySelector('.map__furniture');
      const fr = fur && fur.getBoundingClientRect();
      const sw = document.querySelector('.map__switch');
      const sr = sw && sw.getBoundingClientRect();
      return { doss:{x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height),scrollH:el.scrollHeight},
        furClass: fur && fur.className, switchRect: sr && {x:Math.round(sr.x),y:Math.round(sr.y),w:Math.round(sr.width),h:Math.round(sr.height)} };
    });
    log(w+'x'+h, JSON.stringify(d));
    await shot('vp-'+w);
  }
};
