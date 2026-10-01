/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The contract the authored path (app/js/tours/) drives this surface through. */
module.exports = async ({ page, log, shot }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__ev = []; for (const n of ['compare:ready','compare:open','compare:commit','compare:close','compare:pick']) window.BEA.bus.on(n, p => window.__ev.push(n + ' ' + JSON.stringify(p))); });

  // 1. a preset, by name
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { preset: 'dissolution' }));
  await page.waitForTimeout(800);
  const a = await page.evaluate(() => ({ hash: location.hash, labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g,' ')), phase: document.querySelector('.cmp').dataset.phase, q: (document.querySelector('.cx-ask__q')||{}).textContent }));
  t('bus: preset by name', a.phase === 'ask' && /1945/.test(a.labs[0]) && /how many/i.test(a.q || ''), `${a.hash} · ${a.labs.join(' | ')} · "${(a.q||'').slice(0,60)}…"`);

  // 2. a tour's own two years, its own question, its own answer
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', {
    a: 1783, b: 1815, defA: 'administered', defB: 'administered',
    ask: 'A question written by the tour, not by the compare piece.',
    choices: [{ id: 'x', label: 'Fewer' }, { id: 'y', label: 'More' }], answer: 'y',
  }));
  await page.waitForTimeout(900);
  const b = await page.evaluate(() => ({ hash: location.hash, labs: [...document.querySelectorAll('.cmp__lab')].map(e => e.textContent.replace(/\s+/g,' ')), phase: document.querySelector('.cmp').dataset.phase, q: (document.querySelector('.cx-ask__q')||{}).textContent, ch: [...document.querySelectorAll('.cmp__choice')].map(e=>e.textContent) }));
  t('bus: caller-supplied years, definitions and question', b.phase === 'ask' && /1783/.test(b.labs[0]) && /1815/.test(b.labs[1]) && /administered/.test(b.labs[0]) && b.q === 'A question written by the tour, not by the compare piece.' && b.ch.join() === 'Fewer,More',
    `${b.hash} · ${b.labs.join(' | ')} · choices ${b.ch.join('/')}`);
  await page.click('.cmp__choice[data-id="y"]');
  await page.waitForTimeout(700);
  const c = await page.evaluate(() => ({ hash: location.hash, correct: (document.querySelector('.cmp__guess')||{dataset:{}}).dataset.correct }));
  t('bus: the caller\'s answer key is used', c.correct === 'yes' && /cmpg:y/.test(c.hash), `${c.hash} · marked ${c.correct}`);
  await shot('bus-adhoc');

  // 3. reveal without a question
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922, reveal: true }));
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => ({ phase: document.querySelector('.cmp').dataset.phase, figs: [...document.querySelectorAll('.cmp__f .cx-fig__v')].map(e=>e.textContent) }));
  t('bus: reveal skips the question', d.phase === 'revealed' && d.figs.length === 3, `phase ${d.phase}, figures ${d.figs.join('/')}`);

  // 4. close
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', null));
  await page.waitForTimeout(600);
  const e = await page.evaluate(() => ({ hidden: document.querySelector('.cmp').hasAttribute('hidden'), cy: window.BEA.store.getState().compareYear, hash: location.hash, host: document.querySelector('.stage__over').className }));
  t('bus: null closes and cleans up', e.hidden && e.cy === null && !/compare=/.test(e.hash) && !/cmp-host/.test(e.host), `${e.hash} · host "${e.host}"`);

  // 5. store-only entry (the timeline's compare ghost)
  await page.evaluate(() => window.BEA.store.dispatch('setCompareYear', 1783));
  await page.waitForTimeout(800);
  const f = await page.evaluate(() => ({ hidden: document.querySelector('.cmp').hasAttribute('hidden'), labs: [...document.querySelectorAll('.cmp__lab')].map(e=>e.textContent.replace(/\s+/g,' ')) }));
  t('store: setCompareYear alone opens it', !f.hidden && f.labs.length === 2, f.labs.join(' | '));

  log(await page.evaluate(() => window.__ev.join('\n')));
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> BUS CONTRACT FAILED' : '>>> bus and URL contract holds');
};
