/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-boot.js — the two screens a reader sees when the atlas is not ready:
   the loading state (network slowed) and the error boundary (dataset refused). */
module.exports = async ({ page, shot, log }) => {
  // 1. the loading state, held open
  await page.route('**/app/data/**', async (route) => {
    await new Promise(r => setTimeout(r, 2600));
    try { await route.continue(); } catch (_) { /* page navigated away */ }
  });
  await page.goto('http://localhost:8777/app/', { waitUntil: 'commit' });
  await page.waitForTimeout(900);
  await shot('loading-early');
  await page.waitForTimeout(1400);
  await shot('loading-late');
  log('boot state: ' + await page.evaluate(() => {
    const b = document.getElementById('boot');
    return JSON.stringify({ state: b.dataset.state, status: document.getElementById('boot-status').textContent,
      pct: document.getElementById('boot-progress').style.width });
  }));
  await page.unroute('**/app/data/**');

  // 2. the error boundary
  await page.route('**/data/**', route => route.abort('failed').catch(() => {}));
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await shot('error-boundary');
  log('error state: ' + await page.evaluate(() => {
    const b = document.getElementById('boot');
    return JSON.stringify({ state: b.dataset.state,
      msg: document.getElementById('boot-error-msg').textContent.slice(0, 160),
      detailHidden: document.getElementById('boot-error-detail').hidden,
      buttons: [...document.querySelectorAll('.boot__actions button')].filter(b => !b.hidden).map(b => b.textContent) });
  }));
};
