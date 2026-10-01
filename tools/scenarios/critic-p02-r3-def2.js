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
  const base = 'http://localhost:8777/app/';
  const read = async () => await page.evaluate(() => {
    const t = document.body.innerText;
    const u = t.match(/([\d,]+)\s+units drawn/);
    const km = t.match(/([\d.,]+)\s+million km²/);
    const terr = t.match(/([\d,]+)\s+territories/);
    const drawn = t.match(/DRAWN NOW\s+(\w+)/);
    return { def: drawn && drawn[1], units: u && u[1], km: km && km[1], terr: terr && terr[1] };
  });
  for (const def of ['claimed','administered','controlled','influenced']) {
    await page.goto(base + '#year=1913&def=' + def);
    await page.reload();
    await page.waitForTimeout(2600);
    log('URL-load def=' + def, JSON.stringify(await read()));
  }
  // now key presses
  await page.goto(base + '#year=1913'); await page.reload(); await page.waitForTimeout(2600);
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(900);
    log('key ' + k, JSON.stringify(await read()));
    await shot('key-' + k);
  }
  log('ERR', JSON.stringify(errs));
};
