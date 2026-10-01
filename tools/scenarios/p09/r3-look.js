/** P09 round 3: where does the entry live, and what does the sheet look like. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.mechanism && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const e = document.querySelector('.mx-entry');
      const b = e && e.getBoundingClientRect();
      const doc = document.documentElement;
      const app = document.getElementById('app');
      const inView = b ? (b.left >= -1 && b.right <= innerWidth + 1 && b.width > 0) : null;
      const bar = document.querySelector('.app__bar') || document.querySelector('header');
      const barR = bar && bar.getBoundingClientRect();
      return {
        stage: app && app.dataset.stage, rail: app && app.dataset.rail,
        vw: innerWidth, vh: innerHeight,
        entry: b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), hidden: e.hidden } : null,
        inView,
        bar: barR ? { w: Math.round(barR.width), h: Math.round(barR.height), sw: bar.scrollWidth, cw: bar.clientWidth } : null,
        docScroll: doc.scrollHeight, docH: innerHeight,
      };
    });
    log(tag + ' ' + JSON.stringify(r));
    return r;
  };

  await probe('cold(plate)');
  // move to working
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(400);
  await probe('working');
  await shot('01-working-bar');

  // open the matrix
  await page.evaluate(() => window.BEA.mechanism.open({}));
  await page.waitForTimeout(700);
  await probe('open');
  await shot('02-open-ask');

  // commit a prediction
  await page.evaluate(() => { const b = document.querySelector('.mx-ch'); if (b) b.click(); });
  await page.waitForTimeout(600);
  await shot('03-revealed');

  const t = await page.evaluate(() => {
    const tw = document.querySelector('.mx-tw');
    const tb = document.querySelector('.mx-t');
    const body = document.querySelector('.cx-sheet__body');
    const r = (n) => { const b = n && n.getBoundingClientRect(); return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null; };
    return { wrap: r(tw), table: r(tb), sheetBody: r(body),
      tableScrollW: tb && tb.scrollWidth, wrapClientW: tw && tw.clientWidth,
      bodyScrollH: body && body.scrollHeight, bodyClientH: body && body.clientHeight };
  });
  log('table ' + JSON.stringify(t));

  // sort by how it left -> counter
  await page.evaluate(() => { const bs = [...document.querySelectorAll('.mx-sort')]; const b = bs.find(x => /how it left/.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(800);
  await shot('04-counter');
};
