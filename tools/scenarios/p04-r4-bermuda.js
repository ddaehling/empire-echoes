/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const path = require('path'); const out = process.env.INSPECT_OUT || '/tmp';
  await page.goto('http://localhost:8777/app/#year=1700&sel=bermuda', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const clip = await page.evaluate(() => {
    const r = document.querySelector('.app__dossier').getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  await page.evaluate(() => {
    const h = document.querySelector('.app__dossier'); const n = document.querySelector('#dsr-actors');
    h.scrollTop = n.getBoundingClientRect().top - h.getBoundingClientRect().top + h.scrollTop - 70;
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'bermuda-actors.png'), clip });
  log(await page.evaluate(() => document.querySelector('#dsr-actors').innerText.replace(/\s+/g, ' ')));
};
