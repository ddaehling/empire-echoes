/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const M = () => {
  const rr = e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
    return { r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), +r.height.toFixed(2)],
             bs: c.blockSize, box: c.boxSizing, bt: c.borderTopWidth, bb: c.borderBottomWidth,
             ch: e.clientHeight, sh: e.scrollHeight }; };
  const out = {};
  for (const s of ['.app__sheet', '.cx-sheet', '.cx-sheet__head', '.cx-sheet__body', '.sheet__body', '.app__dossier']) {
    const e = document.querySelector(s); if (e && e.getBoundingClientRect().height > 0) out[s] = rr(e);
  }
  const cs = getComputedStyle(document.documentElement);
  out._vars = { sheetMin: cs.getPropertyValue('--cx-sheet-min').trim(),
    railTopMin: getComputedStyle(document.getElementById('app')).getPropertyValue('--rail-top-min').trim(),
    timeH: getComputedStyle(document.getElementById('app')).getPropertyValue('--time-h').trim(),
    sheetId: document.getElementById('app').getAttribute('data-sheet-id') };
  return out;
};
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.BEA.bus.emit('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1200);
  const marks = await page.$$('.tl-mark');
  log('marks: ' + marks.length);
  if (marks.length) {
    await marks[Math.floor(marks.length / 2)].click({ force: true });
    await page.waitForTimeout(1400);
  }
  log('AFTER MARK CLICK ' + JSON.stringify(await page.evaluate(M), null, 1));
  await shot('mark-sheet');
};
