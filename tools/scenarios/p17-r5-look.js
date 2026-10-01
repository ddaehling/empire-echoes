/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  page.on('requestfailed', r => errs.push('REQFAIL '+r.url()));
  await page.waitForTimeout(2800);
  const clip = async (name, sel) => {
    const h = await page.$(sel);
    if (!h) { log('no ' + sel); return; }
    const b = await h.boundingBox();
    if (!b) { log('no box ' + sel); return; }
    const pad = 8;
    await page.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp', name + '.png'),
      clip: { x: Math.max(0,b.x-pad), y: Math.max(0,b.y-pad), width: b.width+pad*2, height: b.height+pad*2 } });
  };
  await shot('boot');
  await page.keyboard.press('2'); await page.waitForTimeout(700); await shot('def2');
  await page.keyboard.press('w'); await page.waitForTimeout(500);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(900); await shot('wsh');
  log('ERRORS ' + JSON.stringify(errs));
};
