module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  const before = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return { map: b('.stage__map canvas') || b('.stage__map svg'), stage: b('.app__stage'), mech: !!(window.BEA && window.BEA.mechanism) };
  });
  log('BEFORE ' + JSON.stringify(before));

  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', {}));
  await page.waitForTimeout(700);
  await shot('01-sealed');

  const after = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      map: b('.stage__map canvas') || b('.stage__map svg'),
      sheet: b('.app__sheet'), body: b('.mx'),
      table: b('.mx-t'),
      hash: location.hash,
      m: window.BEA.mechanism ? window.BEA.mechanism.matrix.filled + '/' + window.BEA.mechanism.matrix.possible : null,
    };
  });
  log('AFTER ' + JSON.stringify(after));

  // commit the prediction
  await page.click('.mx-ch:nth-child(3)');
  await page.waitForTimeout(500);
  await shot('02-revealed');

  const doc = await page.evaluate(() => ({ scrollH: document.documentElement.scrollHeight, inner: innerHeight }));
  log('DOC ' + JSON.stringify(doc));
};
