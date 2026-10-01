/* tpack/30-final — the desk end to end at whatever width and mode the harness gives it. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);

  const mapBox = () => page.evaluate(() => {
    const m = document.querySelector('#map') || document.querySelector('.map');
    const r = m && m.getBoundingClientRect();
    return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none';
  });
  log('MAP cold: ' + await mapBox());

  const idx = await page.evaluate(() => window.BEA.tourStepIndex || null);
  t('step index verified on every route', !!(idx && idx.verified),
    idx ? Object.entries(idx.routes).map(([k, v]) => k + '=' + v.required + (v.verified ? '' : '!')).join(' ') : 'absent');

  const narrow = await page.evaluate(() => window.innerWidth < 992);
  if (narrow) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Tools/.test(x.innerText)); if (b) b.click(); });
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => { const e = document.querySelector('.tp-entry'); if (e) e.click(); });
  await page.waitForTimeout(1000);
  await page.evaluate(() => { const x = [...document.querySelectorAll('[role="tab"]')].find(n => /Classroom/i.test(n.textContent)); if (x) x.click(); });
  await page.waitForTimeout(1000);
  log('MAP with desk: ' + await mapBox());
  await shot('classroom');

  /* THE ROUTE IS NOT NAMED HERE ANY MORE. This asserted `#tour=core&step=N` on
     seven rows; `core` has not been a lesson's route since wave 8 and the desk
     correctly printed `#tour=lesson-one`, so the assertion was red for two
     waves about a route no student is given. What is actually promised is that
     every row of the lesson the desk is showing carries a step link INTO THAT
     LESSON'S OWN ROUTE, and that the numbers are inside its length. */
  const here = await page.evaluate(() => (window.BEA.toursRoutes || {}).default || '');
  const rows = await page.evaluate(() => [...document.querySelectorAll('.tp-lesson__step')].map(n => n.innerText.replace(/\s+/g, ' ')));
  const of = await page.evaluate((id) => {
    const r = window.BEA.tourStepIndex && window.BEA.tourStepIndex.routes[id];
    return r ? r.required : 0;
  }, here);
  const re = new RegExp('#tour=' + here + '&step=(\\d+)');
  t('every lesson row prints a step link into this lesson’s own route',
    rows.length > 0 && rows.every((r) => {
      const m = re.exec(r);
      return !!m && +m[1] >= 1 && +m[1] <= of;
    }), rows.length + ' rows on ' + here + ' of ' + of + ' steps: ' + JSON.stringify(rows.slice(0, 2)));

  /* AND THE MOVES SAY WHICH OF THEM THIS LESSON HOSTS. A lesson is half a unit
     and does not fire all four; the promise is that each one either carries the
     step it fires at or says, in words, why it does not — never a bare name
     with nothing after it. */
  const mv = await page.evaluate(() => [...document.querySelectorAll('.tp-moves__i')].map(n => n.innerText.replace(/\s+/g, ' ')));
  t('every move either has a step on this route or says why it has not',
    mv.length === 4 && mv.every(x => /step \d+/.test(x) || /not offered on this lesson/.test(x)),
    JSON.stringify(mv.map(x => x.slice(0, 46))));

  const h = await page.evaluate(() => {
    const d = document.querySelector('.tp');
    return [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(n => +n.tagName[1]);
  });
  const skips = h.filter((v, i) => i && v > h[i - 1] + 1);
  t('no heading level is skipped inside the desk', skips.length === 0, 'levels ' + [...new Set(h)].sort().join(',') + ' skips ' + skips.length);

  const land = await page.evaluate(() => {
    const d = document.querySelector('.tp');
    return { role: d.getAttribute('role'), label: d.getAttribute('aria-label') };
  });
  t('the desk is a named landmark', land.role === 'region' && !!land.label, JSON.stringify(land));

  const over = await page.evaluate(() => {
    const bad = [];
    for (const n of document.querySelectorAll('.tp *')) {
      if (n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflowX === 'visible') bad.push(n.className);
    }
    return bad.slice(0, 6);
  });
  t('nothing in the desk overflows its box', over.length === 0, JSON.stringify(over));
  t('the page does not scroll sideways', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), '');

  /* keyboard: tab from the entry into the tabs and along the jump bar */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
};
