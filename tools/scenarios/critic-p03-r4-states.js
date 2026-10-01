/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.waitForTimeout(3000);
  const spine = async (label) => {
    const s = await page.evaluate(() => {
      const n = document.querySelector('.tl-spine');
      if (!n) return { present: false };
      const r = n.getBoundingClientRect();
      return { present: true, w: Math.round(r.width), h: Math.round(r.height), vis: r.width>0&&r.height>0, caption: n.querySelector('.tl-spine__caption')?.innerText.slice(0,70) };
    });
    log(label + ': ' + JSON.stringify(s));
  };
  await spine('free-explore');
  // tours
  const tourIds = await page.evaluate(async () => { try { const r = await fetch('/app/js/tours/index.js'); const t = await r.text(); return (t.match(/id: '([a-z0-9-]+)'/g)||[]).slice(0,12); } catch(e){ return 'x'; } });
  log('tour ids in source:', JSON.stringify(tourIds));
  await page.evaluate(() => { location.hash = '#year=1857&tour=company-rule&step=3'; });
  await page.waitForTimeout(1500);
  await spine('tour');
  await shot('tour');
  await page.evaluate(() => { location.hash = '#year=1857&compare=1914'; });
  await page.waitForTimeout(1500);
  await spine('compare');
  await shot('compare');
  await page.evaluate(() => { location.hash = '#panel=close'; });
  await page.waitForTimeout(1500);
  await spine('close-panel');
  await shot('close');
  // Esc Esc
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  await spine('after esc esc');
  await shot('escesc');
  log('errors:', JSON.stringify(errs));
};
