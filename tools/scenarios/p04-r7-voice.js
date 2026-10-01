/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 7 — whose words, and whose names.
 * Round 3: "the testimony is overwhelmingly imperial. Kenya 1954 offers five
 * texts written at the time, all by Britons, and no Kenyan; Bengal offers one
 * Indian of four. Add colonised-voice testimony to the twenty highest-traffic
 * entries and surface named colonised actors in the top-six WHO WAS HERE."
 * This counts both, on the running app, for the twenty entries in question.
 */
const TWENTY = [
  'british-india', 'bengal-presidency', 'kenya', 'nigeria', 'jamaica', 'new-zealand',
  'egypt', 'gold-coast', 'ireland', 'union-of-south-africa', 'commonwealth-of-australia',
  'canada', 'hong-kong', 'mandatory-palestine', 'ceylon', 'barbados', 'sierra-leone',
  'uganda', 'southern-rhodesia', 'punjab-province',
];

module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.testimony, null, { timeout: 20000 });

  const audit = await page.evaluate(() => window.BEA.testimony.audit());
  log('TESTIMONY AUDIT (must be empty): ' + JSON.stringify(audit) + (audit.length ? ' -> FAIL' : ' -> PASS'));
  const stats = await page.evaluate(() => window.BEA.testimony.stats());
  log('CORPUS: ' + JSON.stringify(stats));

  let noSubject = 0;
  let leads = 0;
  let withNames = 0;
  for (const id of TWENTY) {
    await page.goto('http://localhost:8777/app/#year=1900&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(1600);
    const r = await page.evaluate(() => {
      const tz = document.querySelector('[data-block="testimony-promo"]');
      const az = document.querySelector('[data-block="actors-promo"] .dsr__promoline');
      return {
        authors: tz ? (tz.querySelector('.dsr__promoline') || {}).textContent : null,
        say: tz ? (tz.querySelector('.dsr__promosay') || {}).textContent : null,
        top6: az ? az.textContent : null,
      };
    });
    const tally = await page.evaluate(async () => {
      const b = document.querySelector('[data-act="sheet"][data-sheet="testimony"]');
      if (!b) return null;
      b.click();
      await new Promise((r) => setTimeout(r, 350));
      const t = document.querySelector('.cx-sheet__body .dsr__testtally');
      const first = document.querySelector('.cx-sheet__body .src__speaker');
      return { tally: t ? t.textContent.slice(0, 190) : null, first: first ? first.textContent : null };
    });
    const none = !!(tally && tally.tally && /nobody from here wrote any of these/.test(tally.tally));
    if (none) noSubject++;
    if (!none && tally && tally.first) leads++;
    if (r.top6) withNames++;
    log(id + ' | first text: ' + (tally ? tally.first : '(none)')
      + ' | ' + (tally ? String(tally.tally).slice(0, 120) : '')
      + ' | who was here: ' + String(r.top6).slice(0, 120));
  }
  log('of ' + TWENTY.length + ' entries: ' + leads + ' now name a colonised-side text, '
    + noSubject + ' still hold only British documents and say so, ' + withNames + ' print names above the fold.');
};
