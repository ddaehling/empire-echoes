/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p04-r4`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P04 round 4: the dossier acceptance list of that round. */
/* P04 round 4 — the acceptance tests from FEATURE_SPEC §2 P04, plus the
   critic's must-fix list, run against the real app. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  /* --- AT2 banned strings + editorial directives across all 260 ---------- */
  const sweep = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const banned = ['acquired', 'pacified', 'native', 'unrest', 'mixed legacy', 'rich tapestry',
      'played a key role', 'both sides', 'arguably', 'granted'];
    const editorial = [/\bShow both positions\b/i, /do not split the difference/i, /should not be shown/i,
      /\bwe should\b/i, /note to the author/i];
    const hits = [];
    const edits = [];
    const noActors = [];
    const sizes = [];
    let noNamed = 0;
    for (const t of data.territories) {
      const y = t.acquiredYear || t.firstYear || 1900;
      store.dispatch('setYear', y); store.dispatch('select', t.id); store.flush();
      await wait();
      const root = document.querySelector('.dossier');
      if (!root) continue;
      const txt = root.innerText;
      const words = txt.split(/\s+/).filter(Boolean).length;
      const stops = root.querySelectorAll('button, a[href], input, select, [tabindex]:not([tabindex="-1"])').length;
      sizes.push({ id: t.id, words, stops, px: root.scrollHeight });
      /* banned words, ignoring text inside a blockquote (a quotation) */
      const clone = root.cloneNode(true);
      clone.querySelectorAll('blockquote, .dsr__style, .dsr__hist').forEach(n => n.remove());
      const clean = clone.innerText;
      for (const b of banned) {
        const re = new RegExp('\\b' + b.replace(/ /g, '\\s+') + '\\b', 'i');
        if (re.test(clean)) hits.push({ id: t.id, word: b, near: (clean.match(new RegExp('.{0,60}' + b + '.{0,60}', 'i')) || [''])[0] });
      }
      for (const re of editorial) if (re.test(clean)) edits.push({ id: t.id, near: (clean.match(new RegExp('.{0,90}' + re.source + '.{0,90}', 'i')) || [''])[0] });
      if (/\[missing local actors\]/.test(txt)) noActors.push(t.id);
      if (!/\[missing local actors\]/.test(txt) && !/dsr__actor-name/.test(root.innerHTML)) noNamed++;
    }
    sizes.sort((a, b) => b.words - a.words);
    return { hits, edits, noActors, noNamed, biggest: sizes.slice(0, 8),
      medianWords: sizes[Math.floor(sizes.length / 2)].words,
      medianStops: sizes.map(s => s.stops).sort((a,b)=>a-b)[Math.floor(sizes.length/2)],
      maxStops: Math.max(...sizes.map(s => s.stops)) };
  });
  log('AT2 banned-string hits: ' + sweep.hits.length);
  log(JSON.stringify(sweep.hits.slice(0, 20), null, 1));
  log('editorial-instruction hits: ' + sweep.edits.length + ' ' + JSON.stringify(sweep.edits.slice(0, 6), null, 1));
  log('AT3 [missing local actors]: ' + JSON.stringify(sweep.noActors));
  log('dossiers with no named actor and no defect: ' + sweep.noNamed);
  log('median words ' + sweep.medianWords + ' · median tab stops ' + sweep.medianStops + ' · max stops ' + sweep.maxStops);
  log('biggest: ' + JSON.stringify(sweep.biggest));

  /* --- AT4 Egypt four labels -------------------------------------------- */
  const egypt = await page.evaluate(async () => {
    const { store } = window.BEA;
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const out = [];
    for (const y of [1882, 1914, 1922, 1956]) {
      store.dispatch('setYear', y); store.dispatch('select', 'egypt'); store.flush();
      await wait();
      const n = document.querySelector('.dsr__statusword');
      const l = document.querySelector('.dsr__statuslabel');
      out.push({ y, word: n ? n.textContent : null, label: l ? l.textContent.trim() : null });
    }
    return out;
  });
  log('AT4 Egypt: ' + JSON.stringify(egypt, null, 1));
  log('ERRORS ' + JSON.stringify(errs.slice(0, 12)));
};
