/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const path = require('path');
  const out = process.env.INSPECT_OUT || '/tmp';
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const clip = await page.evaluate(() => {
    const r = document.querySelector('.app__dossier').getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  const goTo = async (sel) => {
    await page.evaluate((s) => {
      const h = document.querySelector('.app__dossier');
      const n = document.querySelector(s);
      h.scrollTop = n.getBoundingClientRect().top - h.getBoundingClientRect().top + h.scrollTop - 70;
    }, sel);
    await page.waitForTimeout(300);
  };
  await goTo('#dsr-evidence');
  await page.screenshot({ path: path.join(out, 'evidence.png'), clip });
  await goTo('.figure, .src');
  await page.screenshot({ path: path.join(out, 'first-source.png'), clip });
  await goTo('#dsr-taken-full');
  await page.evaluate(() => { const h=document.querySelector('.app__dossier'); h.scrollTop += 1400; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'brief-steps.png'), clip });
  await goTo('#dsr-actors');
  await page.screenshot({ path: path.join(out, 'actors.png'), clip });
  log('gate present: ' + await page.evaluate(() => !!document.querySelector('[data-ask="purpose"]')));
  log('provenance rail ticks: ' + await page.evaluate(() => document.querySelectorAll('.src__rail .src__tick').length));
  log('brief steps: ' + await page.evaluate(() => document.querySelectorAll('.dsr__record[data-short="yes"]').length));
  log('ERRORS ' + JSON.stringify(errs));
};
