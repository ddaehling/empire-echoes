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
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3000);
  // fold the how-to-read panel so the map is visible
  const fold = await page.$('text=FOLD');
  if (fold) { await fold.click(); await page.waitForTimeout(600); }
  await shot('folded');
  const card = async () => (await page.evaluate(() => {
    const el = document.querySelector('.map__switch'); return el ? el.innerText : '(none)';
  }));
  for (const [k,name] of [['p','proj'],['s','stitch'],['w','weight'],['h','silence']]) {
    await page.keyboard.press(k);
    await page.waitForTimeout(1400);
    await shot('mode-'+name);
    log('after '+name+' card:', (await card()).replace(/\n/g,' | ').slice(0,700));
  }
  log('ERRORS', JSON.stringify(errs));
};
