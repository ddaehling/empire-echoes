/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 r3 — what opening a colour row actually gives the student. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.click('.legend__entry[data-status]');
  await page.waitForTimeout(800);
  const el = await page.$('.stage__legend');
  const b = await el.boundingBox();
  await page.screenshot({ path: (process.env.SHOT_DIR || '/tmp') + '/row.png', clip: b });
  log('roll text:', await page.evaluate(() => {
    const r = document.querySelector('.legend__roll');
    return r ? r.innerText.replace(/\n+/g, ' | ').slice(0, 900) : null;
  }));
  log('paint report:', await page.evaluate(() => window.BEA.legend.paintWorked));
  await page.waitForTimeout(600);
  log('paint report after settle:', await page.evaluate(() => window.BEA.legend.paintWorked));
  await shot('01-row');
};
