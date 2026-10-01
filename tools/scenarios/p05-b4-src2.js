/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-src2.js — the four-line task fires twice, on documents whose purposes cut opposite ways. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  const fill = async (sel) => page.evaluate((s) => {
    const tas = [...document.querySelectorAll(s)];
    tas.forEach((t, i) => {
      t.value = 'A written record made by somebody with a reason to be believed, number ' + (i + 1) + '.';
      t.dispatchEvent(new Event('input', { bubbles: true }));
    });
    return tas.length;
  }, sel);
  log('round 1 fields: ' + await fill('.tr-source__form .tr-source__in'));
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.tr-source__go').click());
  await page.waitForTimeout(700);
  const after1 = await page.evaluate(() => ({
    rows: document.querySelectorAll('.tr-source__vs .tr-source__row').length,
    offer: (document.querySelector('.tr-source2__go') || {}).textContent,
    say: (document.querySelector('.tr-source2__say') || {}).textContent,
  }));
  log('after round 1: ' + JSON.stringify(after1));
  await page.evaluate(() => document.querySelector('.tr-source2__go').click());
  await page.waitForTimeout(600);
  const quote = await page.evaluate(() => (document.querySelector('.tr-source2 .tr-source__quote') || {}).textContent);
  log('second doc: ' + String(quote).slice(0, 110));
  log('round 2 fields: ' + await fill('.tr-source2 .tr-source__in'));
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('.tr-source2 .tr-source__go').click());
  await page.waitForTimeout(700);
  const after2 = await page.evaluate(() => ({
    rows: document.querySelectorAll('.tr-source2 .tr-source__vs .tr-source__row').length,
    ours: [...document.querySelectorAll('.tr-source2 .tr-source__ours p')].map(n => (n.textContent || '').slice(0, 50)),
    close: (document.querySelector('.tr-source2 .tr-source__close') || {}).textContent,
    ledger: (() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter(e => /source/.test(e.claimId || '')).map(e => e.claimId); } catch (_) { return []; } })(),
  }));
  log('after round 2: ' + JSON.stringify(after2).slice(0, 900));
  await shot('src2');
};
