const BANNED_RE = /\b(acquired|pacified|natives?|unrest|mixed legacy)\b/i;
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  const geom = async (tag) => log(tag + ' ' + await page.evaluate(() => {
    const p = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); };
    return JSON.stringify({ map: p('.map__frame'), dossier: p('.app__dossier'), time: p('.app__time'), stage: p('.app__stage') });
  }));
  await geom('GEOM cold');
  await page.evaluate(() => { BEA.store.act.setYear(1900); BEA.store.act.select('egypt'); });
  await page.waitForTimeout(1200);
  await geom('GEOM dossier-open');
  // test 1: fold without scrolling
  log('T1 fold: ' + await page.evaluate(() => {
    const f = document.querySelector('.dsr__fold') || document.querySelector('.dossier__body');
    const has = (s) => !!document.querySelector(s);
    return JSON.stringify({ fold: !!f, scrollH: f ? f.scrollHeight : null, clientH: f ? f.clientHeight : null,
      status: has('[data-block=status]'), taken: has('[data-block=taken]'), ended: has('[data-block=ended]'),
      franchise: !!document.querySelector('.dsr__franchise') });
  }));
  // test 2: banned words
  const txt = await page.evaluate(() => document.querySelector('[data-mount=dossier]').innerText);
  const hits = txt.split('\n').filter((l) => BANNED_RE.test(l));
  log('T2 banned: ' + JSON.stringify(hits.slice(0, 5)));
  // test 3: named non-British actor
  log('T3 defect nodes: ' + await page.evaluate(() => document.querySelectorAll('.defect').length));
  // test 4: Egypt status changes
  for (const y of [1882, 1914, 1922, 1956]) {
    await page.evaluate((yy) => BEA.store.act.setYear(yy), y);
    await page.waitForTimeout(450);
    log('T4 ' + y + ': ' + await page.evaluate(() => {
      const s = document.querySelector('[data-block=status] .dsr__statusline, [data-block=status]');
      return s ? s.innerText.split('\n').slice(0, 2).join(' / ') : 'none';
    }));
  }
  await shot('egypt-1956');
  log('errors: ' + await page.evaluate(() => (window.__err || []).length));
};
