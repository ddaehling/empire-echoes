/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const grab = () => {
  const t = s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g,' ').trim() : null; };
  return {
    byline: t('.byline'),
    legend: t('.legend'),
    note: t('.stage__note'),
  };
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const states = [];
  const cap = async (name) => { const g = await page.evaluate(grab); states.push({name, ...g}); log('--- ' + name + ' ---'); log('BYLINE: ' + g.byline); log('LEGEND: ' + (g.legend||'').slice(0,900)); };
  await cap('default');
  for (const k of ['2','3','4','1']) { await page.keyboard.press(k); await page.waitForTimeout(900); await cap('def-'+k); }
  await page.keyboard.press('p'); await page.waitForTimeout(1400); await cap('proj-equalearth'); await shot('proj');
  await page.keyboard.press('w'); await page.waitForTimeout(1400); await cap('weight'); await shot('weight');
  await page.keyboard.press('s'); await page.waitForTimeout(1400); await cap('stitching'); await shot('stitching');
  await page.keyboard.press('h'); await page.waitForTimeout(1400); await cap('silences'); await shot('silences');
  log('=== SUMMARY of "three things wrong" ===');
  for (const s of states) {
    const m = (s.byline||'').match(/Three things wrong[\s\S]*/i);
    log(s.name + ' :: ' + (s.byline||'').slice(0,320));
  }
};
