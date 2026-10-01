module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true }));
  await page.waitForTimeout(600);

  // click the chartered-company row header
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.mx-t__rb')].find(x => /company/.test(x.textContent));
    b.click();
  });
  await page.waitForTimeout(900);
  await shot('01-row-company');
  log('AFTER ROW ' + await page.evaluate(() => location.hash));
  log('MAPNOTE ' + await page.evaluate(() => (document.querySelector('#mx-mapnote')||{}).textContent));
  log('SAY ' + await page.evaluate(() => (document.querySelector('.cx-lede__say')||{}).textContent));

  // scroll the sheet to the detail
  await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); b.scrollTop = document.querySelector('.mx-d').offsetTop - 40; });
  await page.waitForTimeout(300);
  await shot('02-row-detail');

  // sort by how it left -> counter-line
  await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); b.scrollTop = 0; });
  await page.evaluate(() => { [...document.querySelectorAll('.mx-sort')].find(x=>/how it left/.test(x.textContent)).click(); });
  await page.waitForTimeout(900);
  await shot('03-sorted');
  log('COUNTER present ' + await page.evaluate(() => !!document.querySelector('.mx-cn')));
  await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); const c=document.querySelector('.mx-cn'); b.scrollTop = c.offsetTop - 20; });
  await page.waitForTimeout(300);
  await shot('04-counter');
  log('COUNTER TEXT ' + await page.evaluate(() => document.querySelector('.mx-cn').innerText.slice(0,900)));
};
