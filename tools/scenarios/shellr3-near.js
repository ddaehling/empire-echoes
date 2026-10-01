/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shellr3-near`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: what sits near the thumb at the small end. */
/** shellr3-near — the band's repair offer for a link naming an id the atlas
 *  does not hold: it names the right id, and pressing it opens that place. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  await page.goto('http://localhost:8777/app/#year=1857&sel=bengal', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  const a = await page.evaluate(() => ({
    say: (document.querySelector('.cx-lede__say') || {}).textContent || '',
    cta: (document.querySelector('.cx-cta:not([hidden])') || {}).textContent || '',
    sel: window.BEA.store.getState().selectedTerritoryId,
    foot: (document.getElementById('shell-note') || {}).textContent || '',
  }));
  log('BEFORE ' + JSON.stringify(a));
  t('N1 the band names the right id', /bengal-presidency/.test(a.say), a.say.slice(0, 90), 'the id the atlas actually files it under');
  t('N2 the band offers to open it', /Open Bengal Presidency/.test(a.cta), a.cta, 'a control, not just a complaint');
  t('N3 nothing was guessed at', a.sel == null, String(a.sel), 'null until the reader presses');
  await shot('01-offer');
  await page.click('.cx-cta:not([hidden])');
  await page.waitForTimeout(1600);
  const b = await page.evaluate(() => ({
    sel: window.BEA.store.getState().selectedTerritoryId,
    hash: location.hash,
    say: (document.querySelector('.cx-lede__say') || {}).textContent || '',
  }));
  log('AFTER ' + JSON.stringify(b));
  t('N4 pressing it opens that place', b.sel === 'bengal-presidency', String(b.sel), 'bengal-presidency');
  t('N5 the offer stands down', !/is not an id/.test(b.say), b.say.slice(0, 70), 'the band is back to the history');
  await shot('02-opened');

  // and a link with no near match says nothing: the footer note is the answer
  await page.goto('http://localhost:8777/app/#year=1900&sel=zzzqqq', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  const c = await page.evaluate(() => ({
    say: (document.querySelector('.cx-lede__say') || {}).textContent || '',
    foot: (document.getElementById('shell-note') || {}).textContent || '',
  }));
  log('NOMATCH ' + JSON.stringify(c));
  t('N6 no near match, no second voice', !/is not an id/.test(c.say) && /zzzqqq/.test(c.foot),
    'band "' + c.say.slice(0, 40) + '" / foot "' + c.foot.slice(0, 60) + '"', 'the footer note alone');
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> NEAREST BROKEN' : '>>> nearest holds');
};
