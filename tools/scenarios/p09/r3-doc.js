/** Does the document grow as the sheet's content grows? Stage by stage. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  const M = (tag) => page.evaluate((t) => {
    const body = document.querySelector('.cx-sheet__body');
    const de = document.documentElement;
    const tall = [];
    for (const n of de.querySelectorAll('body *')) {
      const r = n.getBoundingClientRect();
      if (r.height > innerHeight * 1.5 && r.width > 40) tall.push((n.className || n.tagName) + ' ' + Math.round(r.height));
    }
    return {
      tag: t,
      docOver: de.scrollHeight - innerHeight,
      bodyOver: document.body.scrollHeight - innerHeight,
      sheetScroll: body ? body.scrollHeight : null,
      sheetClient: body ? body.clientHeight : null,
      sheetOverflow: body ? getComputedStyle(body).overflowY : null,
      tall: tall.slice(0, 6),
    };
  }, tag);

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(300);
  log('closed      ' + JSON.stringify(await M('closed')));

  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(600);
  log('open sealed ' + JSON.stringify(await M('sealed')));

  await page.evaluate(() => { const b = document.querySelector('.mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);
  log('revealed    ' + JSON.stringify(await M('revealed')));

  await page.evaluate(() => { const b = document.querySelector('.mx-pp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);
  log('people      ' + JSON.stringify(await M('people')));

  await page.evaluate(() => { const b = document.querySelector('.mx-cp .mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);
  log('sides       ' + JSON.stringify(await M('sides')));

  await page.evaluate(() => window.BEA.mechanism.close());
  await page.waitForTimeout(500);
  log('closed 2    ' + JSON.stringify(await M('closed2')));
};
