/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.evaluate(() => {
    window.__led = [];
    const tryHook = () => { if (window.__bus || (window.app && window.app.bus)) { const b = window.__bus || window.app.bus; b.on('ledger:append', e => window.__led.push(e)); return true; } return false; };
    if (!tryHook()) { window.__hookInt = setInterval(tryHook, 100); }
  });
  await page.waitForTimeout(2600);
  log('bus exposed: ' + await page.evaluate(() => !!(window.__bus || (window.app && window.app.bus))));
  log('globals: ' + await page.evaluate(() => Object.keys(window).filter(k=>/bus|app|store|atlas/i.test(k)).join(', ')));
  // scroll the whole panel to trigger dwell-based ledger stamps
  await page.evaluate(async () => { const e=document.querySelector('.dossier__body')||document.querySelector('.app__dossier'); if(!e) return; for(let i=0;i<12;i++){ e.scrollTop += e.clientHeight*0.8; await new Promise(r=>setTimeout(r,600)); } });
  await page.waitForTimeout(1200);
  log('ledger entries: ' + await page.evaluate(() => (window.__led||[]).length));
  log('localStorage keys: ' + await page.evaluate(() => Object.keys(localStorage).join(', ')));
  log('ls dump: ' + await page.evaluate(() => Object.keys(localStorage).map(k=>k+'='+localStorage.getItem(k).slice(0,200)).join('\n')));
};
