/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b2-source.js — H2: the student writes the four lines before the atlas shows its own. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2000);
  const before = await page.evaluate(() => ({
    title: (document.querySelector('.cx-sheet__title') || {}).textContent,
    src: (document.querySelector('.tr-source__quote') || {}).textContent,
    cite: (document.querySelector('.tr-source__cite') || {}).textContent,
    check: (document.querySelector('.tr-source__check') || {}).textContent,
    fields: [...document.querySelectorAll('.tr-source__flab')].map(e => e.textContent.trim()),
    filled: [...document.querySelectorAll('.tr-source__in')].map(e => e.value),
    count: (document.querySelector('.tr-source__count') || {}).textContent,
    go: (() => { const b = document.querySelector('.tr-source__go'); return b ? b.textContent + ' disabled=' + b.disabled : null; })(),
    skip: (document.querySelector('.tr-source__skip') || {}).textContent,
    nextLocked: (() => { const n = document.querySelector('.tr-bar__next'); return n ? n.disabled : null; })(),
  }));
  log('BEFORE ' + JSON.stringify(before, null, 1));
  await shot('source-blank');

  await page.evaluate(() => {
    const t = ['A letter, dictated and sent — not a treaty and not a speech.',
      'Lobengula in Bulawayo, 1889, carried to Queen Victoria through British hands.',
      'To repudiate a concession he says was misread to him, to somebody he thought could stop it.',
      'It cannot tell me what the concession-hunters actually said in the room, or what his own council thought.'];
    document.querySelectorAll('.tr-source__in').forEach((ta, i) => {
      ta.value = t[i] || t[0];
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  await page.waitForTimeout(400);
  const mid = await page.evaluate(() => ({
    count: (document.querySelector('.tr-source__count') || {}).textContent,
    go: (() => { const b = document.querySelector('.tr-source__go'); return b ? 'disabled=' + b.disabled : null; })(),
  }));
  log('WRITTEN ' + JSON.stringify(mid));
  await shot('source-written');
  await page.evaluate(() => document.querySelector('.tr-source__go')?.click());
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('.tr-source__row')].map(r => (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 110)),
    nextLocked: (() => { const n = document.querySelector('.tr-bar__next'); return n ? n.disabled : null; })(),
    ledger: (() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter(e => e.kind === 'attributed').map(e => e.claimId + ' :: ' + String(e.youSaid).slice(0, 70)); } catch (_) { return []; } })(),
  }));
  log('AFTER ' + JSON.stringify(after, null, 1));
  await shot('source-revealed');
};
