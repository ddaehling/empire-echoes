/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — extent over time: computed, banded, peak to the right of 1914. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1922));
  await page.evaluate(() => window.BEA.bus.emit('viz:open', { id: 'extent' }));
  await page.waitForTimeout(700);
  await shot('extent-asking');

  const pre = await page.evaluate(() => ({
    chartHidden: !!document.querySelector('.viz-chart[hidden]'),
    text: document.querySelector('.viz-extent').innerText.slice(0, 400),
  }));
  log('BEFORE ' + JSON.stringify(pre, null, 1));

  const t0 = Date.now();
  await page.evaluate(() => document.querySelector('.viz-choice[data-choice="smaller"]').click());
  await page.waitForTimeout(900);
  await shot('extent-revealed');

  const m = await page.evaluate(() => {
    const r = document.querySelector('.viz-extent');
    const marks = [...document.querySelectorAll('.viz-mk')].map((n) => n.dataset.year + ':' + n.innerText.replace(/\n/g, ' '));
    return {
      verdict: document.querySelector('.viz-predict__v').innerText,
      readout: document.querySelector('.viz-chart__readout').innerText,
      marks,
      terr: document.querySelector('.viz-terr__foot').innerText,
      popSays: document.querySelector('.viz-pop__say').innerText,
      dots: document.querySelectorAll('.viz-pop__dot').length,
      method: document.querySelector('.viz-method').innerText.slice(0, 260),
      scrollOK: (() => { const b = document.querySelector('.cx-sheet__body'); return { sh: b.scrollHeight, ch: b.clientHeight }; })(),
    };
  });
  log('AFTER (' + (Date.now() - t0) + 'ms) ' + JSON.stringify(m, null, 1));

  /* the series against tools/audit-timeline.js, which computes the same thing in node */
  const audit = await page.evaluate(() => {
    const s = window.BEA.viz && window.BEA.viz.series;
    return null;
  });

  /* scrub: does the readout follow the year? */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1783));
  await page.waitForTimeout(400);
  log('AT 1783 ' + (await page.evaluate(() => document.querySelector('.viz-chart__readout').innerText)));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(400);
  log('AT 1947 ' + (await page.evaluate(() => document.querySelector('.viz-chart__readout').innerText)));
  await shot('extent-1947');
};
