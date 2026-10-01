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
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:8777/app/' + (process.env.P04HASH || '#year=1857&sel=british-india'), { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const clip = await page.evaluate(() => {
    const r = document.querySelector('.app__dossier').getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  const path = require('path');
  const out = process.env.INSPECT_OUT || '/tmp';
  for (let i = 0; i < 8; i++) {
    await page.screenshot({ path: path.join(out, 'scroll-' + i + '.png'), clip });
    const more = await page.evaluate((n) => {
      const h = document.querySelector('.app__dossier');
      h.scrollTop = n * (h.clientHeight - 40);
      return h.scrollTop + h.clientHeight < h.scrollHeight;
    }, i + 1);
    await page.waitForTimeout(250);
    if (!more) { log('stopped at ' + i); break; }
  }
  log('ERRORS ' + JSON.stringify(errs));
};
