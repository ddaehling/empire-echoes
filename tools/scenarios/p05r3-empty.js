/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05r3-empty.js — an empty guess is refused; a decline is recorded as one. */
module.exports = async ({ page, shot, log }) => {
  const R = []; const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.BEA.bus.emit('tours:start', {}));
  await page.waitForTimeout(900);

  await page.evaluate(() => document.querySelector('.tr-go')?.click());
  await page.waitForTimeout(400);
  const empty = await page.evaluate(() => ({
    led: JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').filter((e) => e.kind === 'predicted').length,
    nag: (document.querySelector('.tr-nag:not([hidden])') || {}).textContent || '',
    invalid: document.querySelector('.tr-num')?.getAttribute('aria-invalid'),
    revealed: !!document.querySelector('.tr-reveal'),
  }));
  t('an empty field records nothing and says why', empty.led === 0 && !!empty.nag && !empty.revealed,
    'predicted entries=' + empty.led + ' aria-invalid=' + empty.invalid + ' nag="' + empty.nag.slice(0, 60) + '"');
  await shot('empty');

  await page.evaluate(() => document.querySelector('.tr-skip')?.click());
  await page.waitForTimeout(500);
  const dec = await page.evaluate(() => {
    const e = JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]').find((x) => x.kind === 'predicted');
    return { said: e && e.youSaid, verdict: e && e.verdict, answer: e && e.answer, reveal: (document.querySelector('.tr-reveal') || {}).textContent || '' };
  });
  t('a decline is recorded as a decline, never as a number',
    !!dec.said && !/^\d/.test(dec.said) && dec.verdict === 'declined' && !!dec.answer,
    'youSaid="' + dec.said + '" verdict=' + dec.verdict + ' answer=' + dec.answer);
  t('the reveal sets it as "no guess", not as a figure', /no guess/i.test(dec.reveal), dec.reveal.replace(/\s+/g, ' ').slice(0, 110));
  await shot('declined');

  /* Line 1 of the Close needs both opening beats, so take the next one before
     asking what it prints. */
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click(); });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.BEA.bus.emit('close:open', {}));
  await page.waitForTimeout(700);
  const close = await page.evaluate(() => ({
    mine: [...document.querySelectorAll('.cl-line__mine')].map((n) => n.textContent).join(' || '),
    zero: /showed 0|said 0\b/.test(document.body.innerText),
  }));
  t('the Close does not print a number the student never gave',
    !close.zero && /chose not to guess/.test(close.mine), 'zero printed=' + close.zero + ' · "' + close.mine.slice(0, 140) + '"');
  await shot('close');
  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> EMPTY-GUESS BROKEN' : '>>> the empty guess is refused');
};
