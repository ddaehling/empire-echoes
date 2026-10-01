const TOUR = process.env.TOUR || 'core';
const N = +(process.env.N || 16);
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(1600);
  const bad = [];
  for (let i = 1; i <= N; i++) {
    await page.evaluate((h) => { location.hash = h; }, '#tour=' + TOUR + '&step=' + i);
    await page.waitForTimeout(900);
    const d = await page.evaluate(() => {
      const s = document.querySelector('.app__sheet');
      const lede = document.querySelector('.app__lede');
      const txt = (s ? s.innerText : '') + '\n' + (lede ? lede.innerText : '');
      const bare = [...document.querySelectorAll('.tr-q--bare')].map(x => x.textContent);
      const figs = [...document.querySelectorAll('.tr-q[data-fig]')].map(x => x.getAttribute('data-fig'));
      const block = document.querySelector('.tr-figs');
      const rows = block ? [...block.querySelectorAll('.tr-figs__row')].map(r => r.getAttribute('data-fig')) : [];
      const defect = block ? (block.innerText.match(/No source for this figure/g) || []).length : 0;
      return { leak: (txt.match(/\{\{fig:[a-z0-9-]+\}\}/g) || []), bare, figs, rows, defect,
        title: (document.querySelector('.cx-sheet__head') || {}).innerText || '' };
    });
    if (d.leak.length || d.bare.length || d.defect || (d.figs.length && d.rows.length !== new Set(d.figs).size)) {
      bad.push(i + ' ' + JSON.stringify(d));
    }
    if (d.figs.length) log('step ' + i + ' figs=' + [...new Set(d.figs)].join(',') + ' rows=' + d.rows.join(','));
  }
  log('PROBLEMS: ' + (bad.length ? JSON.stringify(bad, null, 1) : 'none'));
};
