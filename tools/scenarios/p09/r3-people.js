/** P09 round 3: the people rails. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const b = document.querySelector('.mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(500);

  const sealed = await page.evaluate(() => {
    const pp = document.querySelector('.mx-pp');
    return { present: !!pp, ask: !!(pp && pp.querySelector('.mx-pp__ask')),
      choices: pp ? [...pp.querySelectorAll('.mx-ch')].map(b => b.textContent) : [],
      rails: pp ? pp.querySelectorAll('.mx-pp__r').length : 0 };
  });
  log('sealed ' + JSON.stringify(sealed));
  await page.evaluate(() => { const pp = document.querySelector('.mx-pp'); pp.scrollIntoView(); });
  await shot('01-people-sealed');

  // answer with the WRONG one (biggest by places)
  const res = await page.evaluate(async () => {
    const pp = document.querySelector('.mx-pp');
    const bs = [...pp.querySelectorAll('.mx-ch')];
    bs[0].click();
    await new Promise(r => setTimeout(r, 600));
    const p2 = document.querySelector('.mx-pp');
    const rows = [...p2.querySelectorAll('.mx-pp__r')].map(r => ({
      col: r.dataset.col, lead: r.dataset.lead,
      name: r.querySelector('.mx-pp__nm').textContent,
      bars: [...r.querySelectorAll('.mx-pp__b')].map(b => ({
        k: b.dataset.k, w: b.querySelector('.mx-pp__f') && b.querySelector('.mx-pp__f').style.width,
        v: b.querySelector('.mx-pp__v') ? b.querySelector('.mx-pp__v').textContent : (b.querySelector('.mx-pp__none') || {}).textContent })),
    }));
    return { said: p2.querySelector('.mx-said').innerText, rows, swap: p2.querySelector('.mx-pp__swap').innerText,
      one: (p2.querySelector('.mx-pp__one') || {}).innerText, notes: [...p2.querySelectorAll('.mx-pp__notes .cx-note')].map(x => x.innerText) };
  });
  log('open ' + JSON.stringify(res, null, 1));
  await page.evaluate(() => document.querySelector('.mx-pp').scrollIntoView());
  await shot('02-people-open');
};
