/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=6', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { const s = document.querySelector('.tr-panel__scroll'); if (s) s.scrollTop = s.scrollHeight; });
  await page.waitForTimeout(600);
  await shot('figs-loop');
  // textarea autogrow at the Close
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  const before = await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); return f ? { h: f.clientHeight, sh: f.scrollHeight } : null; });
  await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    f.value = 'Britain’s empire started as sugar islands worked by enslaved Africans who never stopped resisting, became a trading company that ended up ruling India on Indian revenue, turned into a global system painted one colour on a map that hid a dozen kinds of rule, and came apart because the people it ruled organised and Britain went broke.';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    f.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); return f ? { h: f.clientHeight, sh: f.scrollHeight, clipped: f.scrollHeight > f.clientHeight + 2 } : null; });
  log('textarea before ' + JSON.stringify(before) + '  after ' + JSON.stringify(after));
  await shot('signature');
};
