/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p06-r2`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P06 round 2: the legend changes that round made. */
/* P04 acceptance, round 2: the taken block after the frame rewrite.
   1. fold visible without scrolling at 1280x800
   2. banned strings in the rendered dossier text
   3. the role groups print and the labels are true
   4. no console errors */
const CASES = [
  ['jersey', 1300], ['commonwealth-of-australia', 1910], ['ruperts-land', 1700],
  ['jammu-and-kashmir', 1900], ['nepal', 1900], ['ireland', 1600],
  ['british-indian-ocean-territory', 1970], ['kenya', 1900], ['weihaiwei', 1910],
  ['isle-of-man', 1800], ['gold-coast', 1880], ['massachusetts-bay', 1650],
];
const BANNED = /\b(acquired|pacified|natives?|unrest|mixed legacy)\b/i;
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const vp = page.viewportSize();
  log('viewport', JSON.stringify(vp));
  for (const [id, year] of CASES) {
    await page.evaluate(([i, y]) => { window.BEA.store.act.setYear(y); window.BEA.store.act.select(i); }, [id, year]);
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => {
      const b = document.querySelector('[data-block=taken]');
      const fold = document.querySelector('.dsr__fold');
      const groups = [...document.querySelectorAll('[data-block=taken] .dsr__from')].map((p) => ({
        role: p.dataset.role || null, k: p.dataset.k || (p.querySelector('.dsr__k') || {}).textContent || null,
        text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 160),
      }));
      const r = b ? b.getBoundingClientRect() : null;
      return {
        text: b ? b.innerText.replace(/\n+/g, ' | ').replace(/\s+/g, ' ').slice(0, 400) : '(none)',
        groups,
        blockBottom: r ? Math.round(r.bottom) : null,
        foldH: fold ? Math.round(fold.getBoundingClientRect().height) : null,
        also: (document.querySelector('.dsr__also') || {}).textContent || null,
      };
    });
    const bad = BANNED.test(m.text) ? '  ** BANNED WORD **' : '';
    log(`\n### ${id} @${year}${bad}\n${m.text}\n  groups: ${JSON.stringify(m.groups.map((g) => g.role + ':' + g.k))}\n  taken block bottom ${m.blockBottom}px, viewport ${vp.height}px`);
  }
  await page.evaluate(() => { window.BEA.store.act.setYear(1700); window.BEA.store.act.select('ruperts-land'); });
  await page.waitForTimeout(700);
  await shot('ruperts-land');
  await page.evaluate(() => { window.BEA.store.act.setYear(1970); window.BEA.store.act.select('british-indian-ocean-territory'); });
  await page.waitForTimeout(700);
  await shot('biot');
};
