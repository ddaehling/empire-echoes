/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=7', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const b = document.querySelector('.cx-sheet__body');
    const cs = getComputedStyle(b);
    return {
      body: { ch: b.clientHeight, sh: b.scrollHeight, pad: cs.padding, overflow: cs.overflowY },
      kids: [...b.children].map(c => { const r = c.getBoundingClientRect(); const s = getComputedStyle(c); return c.className + ' h=' + Math.round(r.height) + ' y=' + Math.round(r.y) + ' disp=' + s.display + ' bs=' + s.blockSize + ' mb=' + s.marginBottom; }),
    };
  });
  log(JSON.stringify(r, null, 1));
};
