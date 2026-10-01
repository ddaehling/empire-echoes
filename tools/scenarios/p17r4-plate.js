/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — the reading plate: does it open, is it two columns, does the
   app actually compress, and how much of the colour vocabulary is on screen. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const geom = async (tag) => {
    const m = await page.evaluate(() => {
      const g = (sel) => { const e = document.querySelector(sel); if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
                 ch: e.clientHeight, sh: e.scrollHeight }; };
      const cols = [...document.querySelectorAll('.lplate__col')].map(c => ({
        col: c.dataset.col, h: c.clientHeight, sh: c.scrollHeight, pct: Math.round(c.clientHeight / c.scrollHeight * 100) }));
      return { app: g('.app'), stage: g('.app__stage'), map: g('.stage__map'), time: g('.app__time'),
        plate: g('#legend-plate'), byline: g('#legend-byline'), key: g('.legend'),
        body: g('.legend__bodywrap'), cols,
        rows: document.querySelectorAll('.lplate__col--a .legend__entry').length };
    });
    log(tag, JSON.stringify(m));
    return m;
  };
  await geom('CLOSED');
  await shot('closed');
  await page.click('.legend__open');
  await page.waitForTimeout(700);
  await geom('OPEN');
  await shot('open');
  // the criticism route
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.click('.byline__crit');
  await page.waitForTimeout(700);
  await geom('CRIT');
  await shot('crit');
  log('crit items visible:', await page.evaluate(() => {
    const li = [...document.querySelectorAll('.lplate__crit > li')];
    const col = document.querySelector('.lplate__col--b').getBoundingClientRect();
    return li.map(x => { const b = x.getBoundingClientRect();
      return { top: Math.round(b.y), bottom: Math.round(b.y + b.height), inView: b.y >= col.y - 2 && b.y + b.height <= col.y + col.height + 2 }; });
  }));
};
