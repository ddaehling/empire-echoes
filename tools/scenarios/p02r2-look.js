/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  // fold anyone else's panels out of the way so I can see MY plate
  await page.evaluate(() => { document.querySelectorAll('.mount--orphan, .legend, .byline').forEach(n => n.style.display = 'none'); });
  await page.waitForTimeout(300);
  await shot('01-world');
  const isles = await page.evaluate(() => {
    const m = window.__map; const s = m.unitScreen('gb-england');
    return s ? { x: s.x0, y: s.y0, w: s.w, h: s.h } : null;
  });
  log('england', JSON.stringify(isles));
  if (isles) await page.screenshot({ path: require('path').join(process.env.SHOT_DIR || '/tmp', 'isles.png'), clip: { x: Math.max(0, isles.x - 90), y: Math.max(0, isles.y - 90), width: 260, height: 240 } }).catch(e => log('clip fail', e.message));
  const info = await page.evaluate(() => {
    const m = window.__map;
    return {
      proj: m.projection, def: m.definition,
      painted: m.plate.paint.size,
      marks: m.markLayout().size,
      moved: [...m.markLayout().values()].filter(x => x.moved).length,
      tinyTargets: document.querySelectorAll('.map__target.is-tiny').length,
      readout: document.querySelector('.map__switch').innerText.replace(/\n+/g, ' | '),
      names: ['new-hebrides', 'united-arab-emirates', 'botswana', 'kenya', 'turkey', 'iran', 'belize', 'in-west-bengal', 'gibraltar'].map(u => u + ' => ' + (m.plate.paint.has(u) ? m.describe(u) : 'not painted')),
    };
  });
  log('info', JSON.stringify(info, null, 1));
  log('errors', JSON.stringify(errs.slice(0, 6)));
};
