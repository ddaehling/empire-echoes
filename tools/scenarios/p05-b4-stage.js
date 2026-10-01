/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=11', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const m = () => page.evaluate(() => {
    const sc = document.querySelector('.tr-panel__scroll');
    const cols = [...document.querySelectorAll('.tr-tension__col')].map(c => c.dataset.side + ':' + (c.hidden ? 'hidden' : 'shown'));
    return { sh: sc ? sc.scrollHeight : 0, ch: sc ? sc.clientHeight : 0,
      cols, last: (document.querySelector('.tr-tension__last') || {}).hidden,
      go: (() => { const b = document.querySelector('.tr-tension__go'); return b ? b.disabled : null; })(),
      nag: (document.querySelector('.tr-nag') || {}).textContent };
  });
  log('start ' + JSON.stringify(await m()));
  const pick = (side, n) => page.evaluate(([s, i]) => {
    const col = [...document.querySelectorAll('.tr-tension__col')].find(c => c.dataset.side === s);
    if (!col || col.hidden) return 'no-col';
    const lists = col.querySelectorAll('.tr-tension__opts');
    const l = lists[i];
    if (!l) return 'no-list';
    l.children[0].click(); return 'ok';
  }, [side, n]);
  log('a0 ' + await pick('a', 0)); await page.waitForTimeout(250);
  log('a1 ' + await pick('a', 1)); await page.waitForTimeout(500);
  log('after A ' + JSON.stringify(await m()));
  log('b0 ' + await pick('b', 0)); await page.waitForTimeout(250);
  log('b1 ' + await pick('b', 1)); await page.waitForTimeout(500);
  log('after B ' + JSON.stringify(await m()));
  await page.evaluate(() => { const l = document.querySelector('.tr-tension__last .tr-tension__opts'); if (l) l.children[0].click(); });
  await page.waitForTimeout(400);
  log('after last ' + JSON.stringify(await m()));
  await shot('staged');
};
