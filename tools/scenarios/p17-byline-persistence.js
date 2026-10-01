/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — the byline must survive every state the app can be in.
   node tools/inspect.js tools/scenarios/p17-byline-persistence.js --out /tmp/p17-persist */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const present = () => page.evaluate(() => {
    const b = document.querySelector('#legend-byline');
    if (!b) return 'ABSENT';
    const t = b.innerText.replace(/\s+/g, ' ').trim();
    const fields = b.querySelectorAll('.byline__field').length;
    return fields + ' fields :: ' + t.slice(0, 150);
  });

  const states = [
    ['boot', () => {}],
    ['year 1783', () => window.BEA.store.dispatch('setYear', 1783)],
    ['compare on', () => window.BEA.store.dispatch('setCompareYear', 1914)],
    ['tour started', () => window.BEA.store.dispatch('startTour', 'company-rule')],
    ['overlay open', () => window.BEA.store.dispatch('openOverlay', 'methods')],
    ['layer tenure', () => window.BEA.store.dispatch('setLayer', 'tenure')],
    ['legend panel folded', () => window.BEA.store.dispatch('setPanel', { legend: false })],
    ['selection', () => window.BEA.store.dispatch('select', 'barbados')],
    ['stage-note wiped by another module', () => document.querySelector('[data-mount="stage-note"]').replaceChildren()],
    ['playing', () => window.BEA.store.dispatch('play')],
  ];
  for (const [name, fn] of states) {
    await page.evaluate(fn);
    await page.waitForTimeout(260);
    log(name.padEnd(38), await present());
  }
  await page.evaluate(() => window.BEA.store.dispatch('pause'));
  await shot('byline-after-every-state');
  log('legend still mounted:', await page.evaluate(() =>
    !!document.querySelector('[data-mount="legend"]').firstElementChild));
};
