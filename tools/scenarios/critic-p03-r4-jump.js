/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  const truth = await page.evaluate(async () => {
    const m = await import('/app/js/core/data.js');
    const d = await m.loadData({});
    const out = {};
    for (const y of [1856, 1700, 1900, 1963, 1600]) out[y] = d.nextChangeYear(y, 1);
    out['back_1856'] = d.nextChangeYear(1856, -1);
    out.bounds = d.bounds;
    out.counts = d.meta.counts;
    return out;
  });
  log('TRUTH:', JSON.stringify(truth));

  const hash = () => page.evaluate(() => (location.hash.match(/year=(\d+)/)||[])[1]);
  async function focusHandle() {
    await page.evaluate(() => document.querySelector('.tl-ax__handle, .tl-ax [tabindex], .tl-ax input')?.focus());
  }
  for (const y of [1856, 1700, 1900, 1963]) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(500);
    await focusHandle();
    await page.keyboard.press('Shift+ArrowRight');
    await page.waitForTimeout(500);
    log(`Shift+Right from ${y} -> ${await hash()} (expected ${truth[y]})`);
  }
  // plain arrow nudges
  await page.evaluate(() => { location.hash = '#year=1856'; });
  await page.waitForTimeout(500);
  await focusHandle();
  for (let i=0;i<3;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(350); log('nudge ->', await hash()); }
  for (let i=0;i<2;i++){ await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(350); log('nudge back ->', await hash()); }
  // what has focus
  log('active element:', await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className + ' | ' + (document.activeElement.getAttribute('aria-label')||'')));
  // now try without focusing anything (global shortcut?)
  await page.evaluate(() => { location.hash = '#year=1856'; document.body.focus(); });
  await page.waitForTimeout(400);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  log('ArrowRight with body focus ->', await hash());
  log('errs', JSON.stringify(errs));
};
