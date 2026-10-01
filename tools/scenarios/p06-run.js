/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P06 — walk the four-step route the way a reader does: press the control. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(500);
  await page.click('.ly-bar__open');
  await page.waitForTimeout(800);
  const snap = async (t) => {
    const r = await page.evaluate(() => ({
      layer: window.BEA.store.getState().activeLayer,
      count: (document.querySelector('.ly-run__count') || {}).textContent,
      title: (document.querySelector('.ly-run__title') || {}).textContent,
      q: (document.querySelector('.ly-run .cx-ask__q') || {}).textContent,
      choices: [...document.querySelectorAll('.ly-run .ly-predict__b')].map(e => e.textContent),
      next: (document.querySelector('.ly-run__b--next') || {}).textContent,
      then: (document.querySelector('.ly-run__then') || {}).textContent,
      cta: (document.querySelector('.ly-run__cta') || {}).textContent,
      lede: (document.querySelector('.cx-lede__say') || {}).textContent,
      keyRows: [...document.querySelectorAll('.ly-key__row')].map(e => e.textContent.replace(/\s+/g, ' ')),
    }));
    log(t, JSON.stringify(r));
    return r;
  };
  await snap('STEP1-ASK');
  await shot('run-1-ask');
  await page.click('.ly-run .ly-predict__b');
  await page.waitForTimeout(700);
  await snap('STEP1-AFTER');
  await shot('run-1-after');
  await page.click('.ly-run__b--next');
  await page.waitForTimeout(800);
  await snap('STEP2-ASK');
  await page.click('.ly-run .ly-predict__b');
  await page.waitForTimeout(700);
  await page.click('.ly-run__b--next');
  await page.waitForTimeout(800);
  await snap('STEP3-ASK');
  await shot('run-3-ask');
  await page.click('.ly-run .ly-predict__b');
  await page.waitForTimeout(700);
  const s3 = await snap('STEP3-AFTER');
  await shot('run-3-after');
  if (s3.cta) { await page.click('.ly-run__cta'); await page.waitForTimeout(700);
    log('AFTER-CTA', await page.evaluate(() => ({ def: window.__map && window.__map.definition, year: window.BEA.store.getState().year }))); }
  await page.click('.ly-run__b--next');
  await page.waitForTimeout(900);
  await snap('STEP4');
  await shot('run-4');
  await page.click('.ly-run__b--next');
  await page.waitForTimeout(900);
  log('AFTER-CLOSE', await page.evaluate(() => ({
    run: !!document.querySelector('.ly-run'),
    sheetLead: (document.querySelector('.ly-sheet__lead') || {}).textContent,
    runBtn: (document.querySelector('.ly-sheet__run') || {}).textContent,
    layers: [...document.querySelectorAll('.ly-sheet__name')].map(e => e.textContent),
  })));
  await shot('after-close');
};
