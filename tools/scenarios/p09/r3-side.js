/**
 * P09 round 3 — the counterparty recount: the same table counted by who lost.
 * Every expected figure is recounted inside the page from window.BEA.data.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(1000);
  const P = (ok, name, got) => log((ok ? 'PASS  ' : 'FAIL  ') + name + '  ' + got);

  /* open revealed, answer the people ask so the third block is staged in */
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true }));
  await page.waitForTimeout(500);
  await page.evaluate(async () => {
    const a = document.querySelector('.mx-pp .mx-ch');
    if (a) { a.click(); await new Promise(r => setTimeout(r, 400)); }
  });
  await page.waitForTimeout(400);

  /* --- S1: the block is staged, not a wall ----------------------------- */
  const s1 = await page.evaluate(() => ({
    tease: !!document.querySelector('.mx-cp__tease'),
    block: !!document.querySelector('.mx-cp'),
    ask: !!document.querySelector('.mx-cp .cx-ask'),
    rails: document.querySelectorAll('.mx-cp__band').length,
  }));
  P(s1.block && s1.ask && s1.rails === 0, 'S1 counterparty block present and sealed until committed', JSON.stringify(s1));

  /* --- S2: commit, then the count matches an independent recount -------- */
  const s2 = await page.evaluate(async () => {
    const b = document.querySelector('.mx-cp .mx-ch');
    if (!b) return { no: true };
    b.click();
    await new Promise(r => setTimeout(r, 500));

    const d = window.BEA.data, m = window.BEA.mechanism.matrix;
    const get = (id) => (d.byId.get ? d.byId.get(id) : d.byId[id]);
    const LOCAL = new Set(['indigenous-polity', 'indigenous-people', 'regional-state']);
    let counted = 0, euroOnly = 0, both = 0, localOnly = 0, nobody = 0, unsorted = 0;
    for (const c of m.cells.values()) for (const it of c.items) {
      counted++;
      const t = get(it.territoryId);
      const acq = (t.acquisitions || []).filter(a => a.mechanism)[0];
      const ks = new Set(((acq && acq.counterparties) || []).filter(x => x && x.name).map(x => x.kind || 'other'));
      const E = ks.has('european-power'), L = [...ks].some(k => LOCAL.has(k));
      if (E && L) both++;
      else if (E) euroOnly++;
      else if (L) localOnly++;
      else if (ks.has('no-resident-population')) nobody++;
      else unsorted++;
    }
    const printed = [...document.querySelectorAll('.mx-cp__band')].map(li => ({
      band: li.dataset.band,
      n: parseInt((li.querySelector('.mx-cp__v') || {}).textContent || '', 10),
    }));
    const find = (id) => (printed.find(x => x.band === id) || {}).n;
    return {
      counted, euroOnly, both, localOnly, nobody, unsorted,
      printed,
      sum: euroOnly + both + localOnly + nobody + unsorted,
      match: find('euroOnly') === euroOnly && find('both') === both
        && find('localOnly') === localOnly
        && (nobody === 0 || find('nobody') === nobody)
        && (unsorted === 0 || find('unsorted') === unsorted)
        && euroOnly + both + localOnly + nobody + unsorted === counted,
      handle: window.BEA.mechanism.sides ? window.BEA.mechanism.sides().counted : null,
    };
  });
  P(!s2.no && s2.match && s2.counted === s2.handle,
    'S2 the bands equal an independent recount and sum to the table\u2019s own total',
    JSON.stringify(s2));

  /* --- S3: the vocabulary audit names a real row with zero Europeans ---- */
  const s3 = await page.evaluate(() => {
    const box = document.querySelector('.mx-cp__audit');
    if (!box) return { none: true };
    const txt = box.innerText;
    const p = window.BEA.mechanism.sides();
    const row = p.noEuro[0];
    const items = window.BEA.mechanism.matrix.itemsInRow(row.id);
    const named = items.every(it => txt.includes(it.name));
    /* and the claim itself must be true on the data */
    const LOCAL = new Set(['indigenous-polity', 'indigenous-people', 'regional-state']);
    const bad = items.filter(it => (it.takenFrom || []).some(c => c.kind === 'european-power'));
    return { row: row.id, n: row.n, named, badEuro: bad.length, first: txt.split('\n')[0].slice(0, 120) };
  });
  P(!s3.none && s3.named && s3.badEuro === 0,
    'S3 the row audit names every place in a row that truly has no European counterparty',
    JSON.stringify(s3));

  /* --- S4: no gloss on any row claims a European counterparty falsely --- */
  const s4 = await page.evaluate(() => {
    const m = window.BEA.mechanism.matrix;
    const bad = [];
    for (const r of m.rows) {
      if (!r.gloss || !r.total) continue;
      /* a gloss that asserts a European party must be true for at least one
         place in its own row */
      if (!/another European power|a European power cash|European war ended/i.test(r.gloss)) continue;
      const items = m.itemsInRow(r.id);
      const any = items.some(it => (it.takenFrom || []).some(c => c.kind === 'european-power'));
      if (!any) bad.push(r.id);
    }
    return { bad };
  });
  P(s4.bad.length === 0, 'S4 no row gloss asserts a European counterparty its own row does not have', JSON.stringify(s4.bad));

  /* --- S5: every place listed in the detail carries who it was taken from */
  const s5 = await page.evaluate(async () => {
    window.BEA.bus.emit('mechanism:open', { row: 'war-transfer' });
    await new Promise(r => setTimeout(r, 700));
    const rows = [...document.querySelectorAll('.mx-i')];
    const withFrom = rows.filter(r => r.querySelector('.mx-i__from')).length;
    const side = document.querySelector('.mx-d__side');
    const names = document.querySelector('.mx-d__names');
    return {
      rows: rows.length, withFrom,
      side: side ? side.innerText.replace(/\s+/g, ' ').slice(0, 200) : null,
      names: names ? names.innerText.replace(/\s+/g, ' ').slice(0, 200) : null,
    };
  });
  P(s5.rows > 0 && s5.withFrom === s5.rows && !!s5.side && !!s5.names,
    'S5 the detail names who was on the other side, per pick and per place',
    JSON.stringify(s5));

  /* --- S6: the deep link opens the third recount ------------------------ */
  const s6 = await page.evaluate(async () => {
    location.hash = '#year=1900&filter=mech:open,mechCp:open';
    await new Promise(r => setTimeout(r, 900));
    return {
      open: !!document.querySelector('.mx-cp'),
      tease: !!document.querySelector('.mx-cp__tease'),
      hash: location.hash,
    };
  });
  P(s6.open && !s6.tease, 'S6 #filter=mech:open,mechCp:open lands on the counterparty recount', JSON.stringify(s6));

  await shot('side');
};
