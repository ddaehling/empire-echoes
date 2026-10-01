/* FEATURE_SPEC §2 P21 acceptance tests 1, 3, 4, 5, 6, run headlessly. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  /* Walk part of the path, and commit to the things the beats ask, through the
     documented write path. */
  for (let i = 0; i < 12; i++) {
    const cell = page.locator('.tr-field__cell').first();
    if (await cell.count()) { try { await cell.click({ timeout: 400 }); } catch (_) {} }
    const next = page.locator('.tr-bar__next');
    if (!(await next.count())) break;
    try { await next.click({ timeout: 800 }); } catch (_) { break; }
    await page.waitForTimeout(260);
  }
  await page.evaluate(() => {
    const b = window.BEA.bus;
    b.emit('ledger:append', { kind: 'predicted', claimId: 'p05:poster:statusCount', beatId: 'poster', prompt: 'how many kinds of rule', youSaid: '2', answer: '11', verdict: 'corrected', year: 1921 });
    b.emit('ledger:append', { kind: 'predicted', claimId: 'p05:who-took-bengal:q', beatId: 'who-took-bengal', prompt: 'who conquered Bengal', youSaid: 'the British government', answer: 'the East India Company', verdict: 'corrected', year: 1757 });
    b.emit('ledger:append', { kind: 'sorted', claimId: 'p05:compensation:order', beatId: 'compensation', prompt: 'the order the money went in', youSaid: '3, 1, 2, 4, 5', answer: 'The owners were paid first.', verdict: 'corrected', year: 1836 });
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'accept' }));
  await page.waitForTimeout(900);
  const t1 = await page.evaluate(() => {
    const lines = [...document.querySelectorAll('.cl-line')];
    const full = lines.filter((l) => l.dataset.can === 'yes');
    const grey = lines.filter((l) => l.dataset.can !== 'yes');
    return {
      full: full.length, grey: grey.length,
      fullWithMine: full.filter((l) => l.querySelector('.cl-line__mine')).length,
      greyWithPrice: grey.filter((l) => l.querySelector('.cl-line__go')).length,
      greyReasons: grey.map((l) => l.dataset.why),
      sample: full.map((l) => (l.querySelector('.cl-line__mine') || {}).textContent || '').filter(Boolean).slice(0, 3),
    };
  });
  log('TEST 1 (some full, some grey, every grey priced): ' + JSON.stringify(t1, null, 1));
  await shot('accept-close');

  const t4 = await page.evaluate(async () => {
    const f = document.querySelector('.cl-push__field');
    const b = [...document.querySelectorAll('.cl-push .btn')].find((x) => /Record/.test(x.textContent));
    if (!f || !b) return 'no push-back control';
    f.value = 'I disagree with line 11: the subscription figure needs a source.';
    b.click();
    return [...document.querySelectorAll('.cl-push .cl-block__row')].map((p) => p.textContent.trim().slice(0, 70));
  });
  log('TEST 4 (dissent recorded verbatim): ' + JSON.stringify(t4));

  const t5 = await page.evaluate(() => {
    window.BEA.bus.emit('ledger:append', { kind: 'not-a-kind', claimId: 'x', dwellMs: 4000, clicks: 9 });
    window.BEA.bus.emit('ledger:append', { kind: 'predicted', claimId: 'p05:probe', youSaid: 'x', dwellMs: 4000, clicks: 9, scrollDepth: 3 });
    const raw = JSON.parse(localStorage.getItem('bea.ledger.v1') || '[]');
    const keys = new Set(); raw.forEach((e) => Object.keys(e).forEach((k) => keys.add(k)));
    return { rows: raw.length, keys: [...keys].sort(), badKind: raw.some((e) => e.kind === 'not-a-kind') };
  });
  log('TEST 5 (write path is a whitelist): ' + JSON.stringify(t5));

  /* Test 3: the drawer, and a line that goes back to where it happened. */
  await page.evaluate(() => { const b = [...document.querySelectorAll('.cl-actions .cx-more')].find((x) => /committed/.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(700);
  const t3 = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.cl-ledger__row')];
    return { rows: rows.length, first: rows.length ? rows[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 110) : null,
      backLinks: document.querySelectorAll('.cl-ledger__go').length };
  });
  log('TEST 3 (the drawer, first person, with a way back): ' + JSON.stringify(t3));
  await shot('accept-ledger');

  /* Test 6: sign it, then print. */
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'accept2' }));
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    const n = document.querySelector('.cl-sign__name');
    const b = [...document.querySelectorAll('.cl-sign .btn')].find((x) => /Sign/.test(x.textContent));
    if (f) f.value = 'It began with sugar and enslaved people, was taken over by a company, paid for with Indian taxes, and ended when the people it ruled organised.';
    if (n) n.value = 'A. Student';
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = [...document.querySelectorAll('.cl-actions .btn')].find((x) => /Print/.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(800);
  const t6 = await page.evaluate(() => {
    const p = document.querySelector('.tr-print');
    return { armed: document.documentElement.dataset.p05print, hidden: p.hidden,
      h1: (p.querySelector('h1') || {}).textContent,
      by: (p.querySelector('.tr-print__by') || {}).textContent,
      sections: [...p.querySelectorAll('h2')].map((h) => h.textContent),
      links: [...p.querySelectorAll('.tr-print__link')].map((s) => s.textContent).slice(0, 4),
      dissent: /disagree with line 11/.test(p.textContent) };
  });
  log('TEST 6 (the sheet): ' + JSON.stringify(t6, null, 1));
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  await shot('accept-sheet');
  await page.emulateMedia({ media: 'screen' });
};
