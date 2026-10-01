/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.cx-cta');
  await page.waitForTimeout(1200);
  await shot('step01');
  for (let i = 1; i <= 30; i++) {
    const state = await page.evaluate(() => {
      const q = s => { const e = document.querySelector(s); return e ? e.innerText.trim().replace(/\s+/g,' ') : null; };
      const nx = document.querySelector('.tr-bar__next');
      return {
        count: q('.tr-bar__count') || q('.tr-bar'),
        head: (document.querySelector('.tp-panel, .beat, .cx-panel, .tr-panel, aside, .panel') || {}).innerText?.slice(0,900),
        nextLabel: nx ? (nx.getAttribute('aria-label')+' | '+nx.textContent.trim()) : 'NO NEXT',
        nextDisabled: nx ? nx.disabled : null,
      };
    });
    log('--- step ' + i + ' ---');
    log('transport:', JSON.stringify(state.count));
    log('next:', state.nextLabel, 'disabled=', state.nextDisabled);
    log('panel:', (state.head||'').replace(/\n/g,' / ').slice(0,700));
    if (i<=3 || i%4===0) await shot('s'+String(i).padStart(2,'0'));
    const ok = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      if (!n || n.disabled) return false; n.click(); return true;
    });
    if (!ok) { log('NEXT BLOCKED at step ' + i); break; }
    await page.waitForTimeout(700);
  }
  await shot('end');
};
