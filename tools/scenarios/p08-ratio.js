/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — the Ratio Line: no figure before a commitment; keyboard-operable. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:kenya' }));
  await page.waitForTimeout(700);
  await shot('ratio-asking');

  const before = await page.evaluate(() => {
    const r = document.querySelector('.viz-ratio');
    const txt = r ? r.innerText : '';
    return {
      state: r && r.dataset.state,
      saysLog: /logarithmic/i.test(txt),
      // the answer must not be anywhere in the DOM before a commitment
      leaksTarget: /1,000,000|1,090|11,503|5,228/.test(txt),
      targetHidden: !!document.querySelector('.viz-axis__mark--target[hidden]'),
      handle: !!document.querySelector('.viz-axis__handle'),
      role: (document.querySelector('.viz-axis__handle') || {}).getAttribute
        ? document.querySelector('.viz-axis__handle').getAttribute('role') : null,
      text: txt.slice(0, 700),
    };
  });
  log('BEFORE COMMIT ' + JSON.stringify(before, null, 1));

  /* keyboard only: focus the slider, arrow it, Enter to commit */
  await page.evaluate(() => document.querySelector('.viz-axis__handle').focus());
  for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(200);
  const mid = await page.evaluate(() => document.querySelector('.viz-ratio__readout').innerText);
  log('MID DRAG readout: ' + mid);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await shot('ratio-revealed');

  const after = await page.evaluate(() => {
    const r = document.querySelector('.viz-ratio');
    return {
      state: r.dataset.state,
      readout: document.querySelector('.viz-ratio__readout').innerText,
      target: (document.querySelector('.viz-axis__lab--target') || {}).innerText || null,
      also: [...document.querySelectorAll('.viz-also__r')].map((n) => n.innerText.replace(/\n/g, ' ')),
      cite: (document.querySelector('.viz-ratio .cx-src') || {}).innerText || null,
      defects: document.querySelectorAll('.viz-fig--bad').length,
      ledger: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.kind === 'predicted'),
      year: window.BEA.store.getState().year,
      hash: location.hash,
    };
  });
  log('AFTER COMMIT ' + JSON.stringify(after, null, 1));

  /* the other two lines, and the URL round trip */
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:compensation' }));
  await page.waitForTimeout(600);
  await shot('ratio-compensation');
  const lin = await page.evaluate(() => {
    const r = document.querySelector('.viz-ratio');
    return { id: r.dataset.ratio, saysLinear: /linear/i.test(r.innerText), leaks: /£0\b/.test(r.innerText), hash: location.hash };
  });
  log('COMPENSATION ' + JSON.stringify(lin));

  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'ratio:ics' }));
  await page.waitForTimeout(500);
  await shot('ratio-ics');
  log('ICS ' + JSON.stringify(await page.evaluate(() => ({
    id: document.querySelector('.viz-ratio').dataset.ratio,
    defects: document.querySelectorAll('.viz-fig--bad').length,
  }))));
};
