/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.screenshot: Clipped area is either empty or outside the resulting image.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const path = require('path'); const out = process.env.INSPECT_OUT || '/tmp';
  const list = [['#year=1913&sel=barbados','barbados'],['#year=1922&sel=egypt','egypt-1922'],
    ['#year=1840&sel=new-zealand','nz-1840'],['#year=1997&sel=british-india','india-1997'],
    ['#year=1830&sel=jamaica','jamaica'],['#year=1750&sel=gibraltar','gibraltar']];
  for (const [hash, name] of list) {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const clip = await page.evaluate(() => {
      const r = document.querySelector('.app__dossier').getBoundingClientRect();
      return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
    });
    await page.screenshot({ path: path.join(out, name + '.png'), clip });
    log('### ' + name + ' :: ' + await page.evaluate(() => {
      const h = document.querySelector('.dsr__head'), f = document.querySelector('.dsr__fold');
      return (h.innerText + ' || ' + f.innerText).replace(/\n+/g, ' | ');
    }));
  }
  log('ERRORS ' + JSON.stringify(errs));
};
