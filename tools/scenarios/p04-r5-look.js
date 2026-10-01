/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — the visual pass. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await shot('01-arrive');
  const d = () => page.evaluate(() => { const a = document.querySelector('.app__dossier'); return { t: Math.round(a.getBoundingClientRect().top), b: Math.round(a.getBoundingClientRect().bottom), h: Math.round(a.getBoundingClientRect().height), sh: a.scrollHeight }; });
  log('dossier box: ' + JSON.stringify(await d()));
  await page.evaluate(() => { document.querySelector('.app__dossier').scrollTop = 620; });
  await page.waitForTimeout(300);
  await shot('02-argument');
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(300);
  await shot('03-testimony');
  /* answer the attribution gate */
  const gated = await page.evaluate(() => {
    const b = document.querySelector('.src__v[data-gate="yes"] .dsr__choice');
    if (!b) return null; b.click(); return b.textContent;
  });
  log('gate answered with: ' + gated);
  await page.waitForTimeout(900);
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(300);
  await shot('04-gate-answered');
  await page.evaluate(() => { const n = document.querySelector('.dsr__pathmark'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(300);
  await shot('05-corepath');
  await page.evaluate(() => { const s = [...document.querySelectorAll('.dsr__extsum')]; if (s[1]) s[1].click(); });
  await page.waitForTimeout(400);
  await shot('06-fold-open');
  await page.evaluate(() => { const n = document.querySelector('#dsr-why'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(300);
  await shot('07-because-chips');
};
