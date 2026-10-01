/* Everything a reader can do to this piece, in one run, watching for noise. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const B = () => page.evaluate(() => window.BEA);

  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', {}));
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelectorAll('.mx-ch')[0].click());     // wrong guess
  await page.waitForTimeout(400);
  // every row header
  const rows = await page.evaluate(() => [...document.querySelectorAll('.mx-t tbody tr')].map(t => t.dataset.row));
  for (const r of rows) {
    await page.evaluate((r) => window.BEA.bus.emit('mechanism:pick', { row: r }), r);
    await page.waitForTimeout(90);
  }
  // every column header
  const cols = await page.evaluate(() => [...document.querySelectorAll('.mx-t__ch[data-id]')].map(t => t.dataset.id));
  for (const c of cols) {
    await page.evaluate((c) => window.BEA.bus.emit('mechanism:pick', { row: null, col: c }), c);
    await page.waitForTimeout(90);
  }
  // every non-empty cell
  const cells = await page.evaluate(() => [...window.BEA.mechanism.matrix.cells.keys()]);
  for (const k of cells) {
    const [row, col] = k.split('|');
    await page.evaluate((p) => window.BEA.bus.emit('mechanism:pick', p), { row, col });
    await page.waitForTimeout(45);
  }
  log('picked ' + rows.length + ' rows, ' + cols.length + ' cols, ' + cells.length + ' cells');
  // sorts both ways, twice
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => [...document.querySelectorAll('.mx-sort')].forEach(b => b.click()));
    await page.waitForTimeout(200);
  }
  // the five
  await page.evaluate(() => { const b = document.querySelector('.mx-cn__go'); if (b) b.click(); });
  await page.waitForTimeout(500);
  await shot('five');
  log('SAY ' + await page.evaluate(() => (document.querySelector('.cx-lede__say')||{}).textContent));
  // open a place from the list, which must hand the rail to the dossier
  await page.evaluate(() => { const b = document.querySelector('.mx-i__b'); if (b) b.click(); });
  await page.waitForTimeout(700);
  log('AFTER SELECT ' + await page.evaluate(() => location.hash + ' | sheet=' + (document.getElementById('app').dataset.sheet||'-') + ' dossier=' + (document.getElementById('app').dataset.dossier||'-')));
  // scrub the year while a set is painted
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { col: 'still-a-territory' }));
  await page.waitForTimeout(400);
  for (const y of [1650, 1800, 1947, 1997, 2020]) {
    await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), y);
    await page.waitForTimeout(120);
  }
  log('MAPNOTE ' + await page.evaluate(() => (document.querySelector('#mx-mapnote')||{}).textContent));
  await shot('still-british');
  // and destroy cleanly
  await page.evaluate(() => window.BEA.registry.get('mechanism'));
  await page.evaluate(() => window.BEA.mechanism.close());
  await page.waitForTimeout(400);
  log('END ' + await page.evaluate(() => location.hash));
};
