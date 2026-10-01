/* hh/26-links — every deep link the printed plan prints, opened cold. */
const LINKS = ['#tour=period&step=1','#year=1921&layer=status','#tour=period&step=2','#year=1820',
  '#tour=period&step=3','#year=1831&sel=jamaica','#tour=period&step=6','#year=1765&sel=bengal-presidency',
  '#tour=period&step=8','#year=1882&sel=egypt','#tour=period&step=9','#year=1942&sel=singapore',
  '#tour=period&step=10','#year=2025','#panel=evidence','#filter=stage:apparatus','#panel=classroom'];
module.exports = async ({ page, log }) => {
  for (const h of LINKS) {
    await page.goto('http://localhost:8777/app/' + h, { waitUntil: 'load' });
    try {
      await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
    } catch (e) { log(h + '  !! NEVER READY'); continue; }
    await page.waitForTimeout(1400);
    const s = await page.evaluate(() => {
      const st = window.BEA.store.getState();
      return { year: st.year, sel: st.selection || st.sel || (st.filters && st.filters.sel) || null,
        title: document.querySelector('.cx-sheet__title')?.textContent || document.querySelector('.dsr__name')?.textContent || '',
        count: document.querySelector('.tr-bar__count')?.textContent || '', errs: 0 };
    });
    log(h.padEnd(36) + ' year=' + s.year + ' sel=' + JSON.stringify(s.sel) + ' | ' + (s.count ? s.count + ' | ' : '') + s.title.slice(0, 60));
  }
};
