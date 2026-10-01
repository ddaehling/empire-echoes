/* tpack/08-screen — the classroom tab on screen: the two links, and the map beside it. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  const mapBefore = await page.evaluate(() => {
    const m = document.querySelector('#map') || document.querySelector('.map');
    const r = m && m.getBoundingClientRect();
    return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none';
  });
  log('MAP before desk: ' + mapBefore);
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(900);
  const mapAfter = await page.evaluate(() => {
    const m = document.querySelector('#map') || document.querySelector('.map');
    const r = m && m.getBoundingClientRect();
    return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none';
  });
  log('MAP with desk: ' + mapAfter);
  const links = await page.evaluate(() => [...document.querySelectorAll('.tp-lesson__b')].map(li => ({
    t: (li.querySelector('.tp-lesson__t') || {}).innerText,
    step: (li.querySelector('.tp-lesson__step') || {}).innerText.replace(/\s+/g, ' '),
    map: (li.querySelectorAll('.tp-lesson__link')[1] || li.querySelector('.tp-lesson__link') || {}).innerText,
  })));
  log('LESSON ROWS: ' + JSON.stringify(links, null, 1));
  // scroll the classroom panel to the lesson block and shoot it
  await page.evaluate(() => { const n = document.querySelector('.tp-lesson'); if (n) n.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(500);
  await shot('lesson-rows');
  // and the pack list
  await page.evaluate(() => { const n = document.querySelector('[data-pack="plan"]'); if (n) n.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(400);
  await shot('pack-list');
  // click a rejoin link and confirm the address
  const href = await page.evaluate(() => {
    const a = document.querySelector('.tp-lesson__step .cx-more');
    return a ? a.getAttribute('href') : null;
  });
  log('first rejoin href: ' + href);
};
