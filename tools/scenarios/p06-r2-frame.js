/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p06 round 2 — read the WHOLE taken block as printed, for the records the
   critics named. Eyebrow + verb + date + counterparty label + names. */
const CASES = [
  ['jersey', 1300], ['guernsey', 1300], ['commonwealth-of-australia', 1910],
  ['great-britain', 1800], ['union-of-south-africa', 1930], ['federation-of-malaya', 1950],
  ['jammu-and-kashmir', 1900], ['nepal', 1900], ['ireland', 1600],
  ['pennsylvania', 1700], ['newfoundland', 1700], ['ruperts-land', 1700],
  ['kuwait', 1910], ['british-east-africa', 1900], ['straits-settlements', 1850],
];
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  for (const [id, year] of CASES) {
    const ok = await page.evaluate(([i, y]) => {
      try { window.BEA.store.act.setYear(y); window.BEA.store.act.select(i); return true; } catch (e) { return String(e); }
    }, [id, year]);
    await page.waitForTimeout(700);
    const txt = await page.evaluate(() => {
      const b = document.querySelector('[data-block=taken]');
      if (!b) return '(( no taken block ))';
      return b.innerText.replace(/\n+/g, ' | ').replace(/\s+/g, ' ').slice(0, 700);
    });
    log(`\n### ${id} @${year} (${ok})\n${txt}`);
  }
  await page.evaluate(() => { window.BEA.store.act.setYear(1300); window.BEA.store.act.select('jersey'); });
  await page.waitForTimeout(800);
  await shot('jersey-taken');
  await page.evaluate(() => { window.BEA.store.act.setYear(1910); window.BEA.store.act.select('commonwealth-of-australia'); });
  await page.waitForTimeout(800);
  await shot('australia-taken');
};
