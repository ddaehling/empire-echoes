/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-look — the cards this round changed, at the size a student holds. */
module.exports = async ({ page, shot, log }) => {
  const open = async (id, year, sel) => {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + sel, { waitUntil: 'load' });
    await page.waitForTimeout(2400);
    const ok = await page.evaluate((i) => window.BEA.quiz.open(i), id);
    await page.waitForTimeout(600);
    return ok;
  };
  log('choose: ' + await open('m15-borders', 1961, 'british-cameroons'));
  const rows = await page.evaluate(() => [...document.querySelectorAll('.qz-opt')].map((e) => {
    const r = e.getBoundingClientRect(); const i = e.querySelector('input').getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height) + ' mark ' + Math.round(i.width) + 'x' + Math.round(i.height);
  }));
  log('option rows: ' + rows.join(' | '));
  await shot('choose');
  log('estimate: ' + await open('t16-bengal-1943', 1943, 'bengal-presidency'));
  const conf = await page.evaluate(() => [...document.querySelectorAll('.qz-conf__o')].map((e) => {
    const r = e.getBoundingClientRect(); const i = e.querySelector('input').getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height) + ' mark ' + Math.round(i.width) + 'x' + Math.round(i.height);
  }));
  log('confidence rows: ' + conf.join(' | '));
  await shot('estimate');
};
