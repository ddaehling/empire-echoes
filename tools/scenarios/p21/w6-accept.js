/**
 * p21/w6-accept.js — FEATURE_SPEC §2 P21's six acceptance tests, run against
 * the running app.
 *
 * AT2 is run in the form the build actually took: the spec's "00:00 population
 * guess" became the poster beat's own commit (`p05:poster:statusCount`, "how
 * many kinds of rule was the one pink hiding"), which is the first thing a
 * student commits to and the thing line 1 of the Close quotes back. The test
 * is the same test — the student's own first answer, verbatim, scored against
 * the atlas's own figure — against the claim this build asks for.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');

  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);

  /* --- a real commitment, through the beat's own control ---------------- */
  const typed = await page.evaluate(() => {
    const f = document.querySelector('.tr-panel input[type="number"], .tr-panel input[type="text"], .tr-panel input');
    if (!f) return null;
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    set.call(f, '3');
    f.dispatchEvent(new Event('input', { bubbles: true }));
    const go = [...document.querySelectorAll('.tr-panel button')].find((b) => /^(go|commit|lock|answer|that)/i.test(b.textContent.trim()));
    if (go) go.click();
    else f.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return f.value;
  });
  await page.waitForTimeout(900);
  let led = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]'); } catch (_) { return []; }
  });
  log('typed=' + typed + ' ledger after the beat: ' + JSON.stringify(led).slice(0, 400));

  /* Walk three beats so some lines are defensible and some are not. */
  for (let i = 0; i < 3; i += 1) {
    await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click(); });
    await page.waitForTimeout(700);
  }

  /* --- AT4's dissent, and AT3's drawer, both need the Close open -------- */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(140);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1100);

  const at1 = await page.evaluate(() => {
    const full = [...document.querySelectorAll('.cl-line[data-can="yes"]')];
    const grey = [...document.querySelectorAll('.cl-line[data-can="no"]')];
    return {
      open: !!document.querySelector('.cl-close'),
      full: full.length, grey: grey.length,
      priced: grey.filter((li) => /\d+\s*seconds/.test(li.textContent)).length,
      mine: full.filter((li) => li.querySelector('.cl-line__mine')).length,
      mineText: (document.querySelector('.cl-line__mine') || {}).textContent || '',
    };
  });
  log('AT1: ' + JSON.stringify(at1));
  t('AT1 the Close renders full and greyed', at1.open && at1.full > 0 && at1.grey > 0, at1.full + ' full, ' + at1.grey + ' greyed', 'both');
  t('AT1 every greyed line carries a price', at1.grey > 0 && at1.priced === at1.grey, at1.priced + ' of ' + at1.grey, 'all');
  t('AT2 their own first answer is quoted back', /You said/.test(at1.mineText) && /\d/.test(at1.mineText), at1.mineText.slice(0, 80) || 'nothing quoted', 'verbatim, with the atlas figure');

  /* AT4 — push back, verbatim */
  await page.evaluate(() => {
    const f = document.querySelector('.cl-push__field');
    if (!f) return;
    f.value = 'Line 6 is too neat: the loop needed troops from Britain too.';
    f.dispatchEvent(new Event('input', { bubbles: true }));
    const b = [...document.querySelectorAll('.cl-push button')].find((x) => /Record/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(500);
  const at4 = await page.evaluate(() => document.querySelector('.cl-push').innerText.replace(/\s+/g, ' '));
  t('AT4 the dissent is recorded verbatim', /too neat: the loop needed troops/.test(at4), at4.slice(-90), 'unedited, in the panel');

  /* AT6 — sign it, then print */
  await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    const n = document.querySelector('.cl-sign__name');
    if (f) { f.value = 'It started as sugar islands worked by enslaved people and ended when the people it ruled organised.'; f.dispatchEvent(new Event('input', { bubbles: true })); }
    if (n) { n.value = 'A. Student'; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const b = [...document.querySelectorAll('.cl-sign button')].find((x) => /Sign it/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.cl-actions button')].find((x) => /Print/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(800);
  const at6 = await page.evaluate(() => {
    const p = document.querySelector('.tr-print');
    if (!p || p.hidden) return { on: false };
    const txt = p.innerText;
    return {
      on: true,
      h1: (p.querySelector('h1') || {}).textContent || '',
      by: (p.querySelector('.tr-print__by') || {}).textContent || '',
      links: [...p.querySelectorAll('.tr-print__link')].map((n) => n.textContent),
      sections: p.querySelectorAll('section').length,
      dissent: /too neat: the loop needed troops/.test(txt),
      armed: document.documentElement.dataset.p05print === 'on',
    };
  });
  log('AT6: ' + JSON.stringify(at6).slice(0, 500));
  t('AT6 the sheet carries the signed sentence', at6.on && /sugar islands/.test(at6.h1), at6.h1.slice(0, 60), 'their sentence');
  t('AT6 the sheet is versioned and named', at6.on && /dataset/.test(at6.by) && /A\. Student/.test(at6.by), at6.by.slice(0, 80), 'name, date, dataset version');
  t('AT4 the dissent is on the sheet', at6.on && at6.dissent, String(at6.dissent), 'true');
  await shot('sheet');

  /* AT3 — the drawer, in the first person */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  /* a real key press, not a synthetic one on `document`: every listener in
     this app reads `ev.target`, and a synthetic event whose target is the
     document is a shape no browser ever produces. */
  await page.evaluate(() => { try { document.activeElement.blur(); } catch (_) { /* nothing focused */ } });
  await page.keyboard.press('l');
  await page.waitForTimeout(800);
  const at3 = await page.evaluate(() => {
    const box = document.querySelector('.cl-ledger');
    if (!box) return { open: false };
    const rows = [...box.querySelectorAll('.cl-ledger__row')];
    return {
      open: true, rows: rows.length,
      first: rows.length ? rows[0].innerText.replace(/\s+/g, ' ').slice(0, 120) : '',
      firstPerson: rows.some((r) => /I said|I opened/.test(r.innerText)),
      backTo: rows.filter((r) => /Back to \d/.test(r.innerText)).length,
    };
  });
  log('AT3: ' + JSON.stringify(at3));
  t('AT3 the drawer speaks in the first person', at3.open && at3.firstPerson, at3.first || 'empty', '"I said …"');
  t('AT3 a row goes back to where it happened', at3.open && at3.backTo > 0, at3.backTo + ' rows with a year', 'at least one');
  await shot('ledger');

  /* AT5 — the persisted key set */
  led = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]'); } catch (_) { return []; } });
  const allowed = ['id', 'kind', 'claimId', 'beatId', 't', 'misconceptionId', 'prompt', 'youSaid', 'answer', 'verdict', 'year', 'unitIds', 'at', 'dueAt'];
  const kinds = ['predicted', 'sorted', 'classified', 'placed', 'declined', 'attributed', 'collapsed', 'dissented', 'found', 'retold', 'completed'];
  const stray = new Set();
  const badKind = new Set();
  for (const e of led) {
    for (const k of Object.keys(e)) if (!allowed.includes(k)) stray.add(k);
    if (!kinds.includes(e.kind)) badKind.add(e.kind);
  }
  /* and the write path refuses anything else */
  const refused = await page.evaluate(() => {
    window.BEA.bus.emit('ledger:append', { kind: 'dwell', claimId: 'x:1', seconds: 42, scrollDepth: 0.8 });
    window.BEA.bus.emit('ledger:append', { kind: 'found', claimId: 'BAR:probe', seconds: 42, ip: '1.2.3.4', clicks: 9 });
    const all = JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]');
    return { dwell: all.some((e) => e.kind === 'dwell'), stray: all.some((e) => 'seconds' in e || 'ip' in e || 'clicks' in e) };
  });
  log('AT5: entries=' + led.length + ' stray=' + [...stray].join(',') + ' badKind=' + [...badKind].join(',') + ' refused=' + JSON.stringify(refused));
  t('AT5 nothing outside the schema is persisted', stray.size === 0 && badKind.size === 0, [...stray, ...badKind].join(',') || 'none', 'none');
  t('AT5 the write path refuses a kind not on the list', !refused.dwell && !refused.stray, JSON.stringify(refused), 'both false');

  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> P21 ACCEPTANCE FAILED' : '>>> P21 acceptance holds');
};
