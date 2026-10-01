/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-map.js — the drawn plate, in the four states this piece can be in. */
const states = [
  ['cold plate', ''],
  ['textual beat (Amritsar)', '#tour=core&step=11'],
  ['map-work beat (the poster)', '#tour=core&step=1'],
  ['a recall card', '#tour=thirty&step=7'],
];
module.exports = async ({ page, log }) => {
  for (const [name, addr] of states) {
    await page.goto('http://localhost:8777/app/' + addr, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const b = (s) => { const e = document.querySelector(s); if (!e) return null; const x = e.getBoundingClientRect(); return { w: Math.round(x.width), h: Math.round(x.height) }; };
      const m = b('.stage__map');
      return { map: m, pct: m ? +((m.w * m.h) / (window.innerWidth * window.innerHeight) * 100).toFixed(1) : null,
        read: document.getElementById('app').dataset.read, win: window.innerWidth + 'x' + window.innerHeight };
    });
    log(name.padEnd(28) + ' map ' + (r.map ? r.map.w + 'x' + r.map.h : 'none') + '  ' + r.pct + '% of ' + r.win + '  data-read=' + r.read);
  }
  // and the Close
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  const c = await page.evaluate(() => {
    const b = (s) => { const e = document.querySelector(s); if (!e) return null; const x = e.getBoundingClientRect(); return { w: Math.round(x.width), h: Math.round(x.height) }; };
    const m = b('.stage__map');
    return { map: m, pct: m ? +((m.w * m.h) / (window.innerWidth * window.innerHeight) * 100).toFixed(1) : null, read: document.getElementById('app').dataset.read, sheet: b('.app__sheet'), time: b('.app__time') };
  });
  log('the Close'.padEnd(28) + ' map ' + (c.map ? c.map.w + 'x' + c.map.h : 'none') + '  ' + c.pct + '%  data-read=' + c.read + '  sheet ' + (c.sheet ? c.sheet.w + 'x' + c.sheet.h : '-') + '  time ' + (c.time ? c.time.w + 'x' + c.time.h : '-'));
};
