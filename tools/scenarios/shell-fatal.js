/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-fatal.js — the error boundary, reached the way it is actually reached:
   a core module that cannot be parsed, so no module script in the document runs
   and only the inline watchdog is left to speak. */
module.exports = async ({ page, shot, log }) => {
  await page.route('**/js/core/data.js', route => route.abort('failed').catch(() => {}));
  await page.goto('http://localhost:8777/app/', { waitUntil: 'commit' });
  await page.waitForTimeout(7000);
  await shot('slow-notice');
  log('at 7s: ' + await page.evaluate(() => JSON.stringify({
    boot: document.documentElement.dataset.boot,
    slowShown: !document.getElementById('boot-slow').hidden })));
  await page.waitForTimeout(9000);
  await shot('error-boundary');
  log('at 16s: ' + await page.evaluate(() => JSON.stringify({
    boot: document.documentElement.dataset.boot,
    state: document.getElementById('boot').dataset.state,
    msg: document.getElementById('boot-error-msg').textContent })));
};
