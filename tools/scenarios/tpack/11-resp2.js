/* tpack/11-resp2 — the classroom tab at any width; on a phone the desk lives behind Tools. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  const mapBox = () => page.evaluate(() => {
    const m = document.querySelector('#map') || document.querySelector('.map');
    const r = m && m.getBoundingClientRect();
    return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none';
  });
  log('MAP cold: ' + await mapBox());
  const direct = await page.evaluate(() => {
    const e = document.querySelector('.tp-entry');
    return !!(e && e.offsetParent !== null);
  });
  if (!direct) {
    log('desk is behind Tools at this width');
    await page.evaluate(() => {
      const t = [...document.querySelectorAll('button')].find(b => /Tools/.test(b.innerText));
      if (t) t.click();
    });
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => { const e = document.querySelector('.tp-entry'); if (e) e.click(); });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role="tab"]')].find(x => /Classroom/i.test(x.textContent));
    if (t) t.click();
  });
  await page.waitForTimeout(1000);
  log('MAP with desk: ' + await mapBox());
  await shot('desk-classroom');
  log('OVERFLOW: ' + JSON.stringify(await page.evaluate(() => {
    const bad = [];
    for (const n of document.querySelectorAll('.tp-lesson__step, .tp-lesson__link, .tp-packs__i, .tp-lesson__b, .tp-packs__t')) {
      if (n.scrollWidth > n.clientWidth + 2) bad.push(n.className + ' ' + n.scrollWidth + '>' + n.clientWidth);
    }
    return bad.slice(0, 12);
  })));
  log('page h-overflow px: ' + await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
  await page.evaluate(() => { const n = document.querySelector('.tp-lesson'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(400);
  await shot('lesson');
  await page.evaluate(() => { const n = document.querySelector('[data-pack="key"]'); if (n) n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  await shot('packs');
};
