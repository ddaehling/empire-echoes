/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const go = async (y) => { await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y); await page.waitForTimeout(700); };

  await go(1913);
  log('aden@1913 ' + JSON.stringify(await page.evaluate(() => {
    const st = window.BEA.data.statusAt(1913);
    const m = window.BEA.map;
    return { inStatus: st.has('aden'), painted: m.plate.paint.has('aden'),
      screen: m.unitScreen('aden'), target: !!document.querySelector('.map__target[data-unit="aden"]'),
      targets: document.querySelectorAll('.map__target').length };
  })));

  await go(1900);
  const lab = await page.evaluate(() => {
    const m = window.BEA.map;
    return m.plate.labelsDrawn.map(l => ({ t: l.text, ghost: !!l.ghost, k: l.kind || null, style: l.style || null }));
  });
  log('labels@1900 (' + lab.length + ') ' + JSON.stringify(lab));

  log('hawaii tip ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map;
    const s = m.unitScreen('hawaii');
    if (!s) return 'no screen';
    m.hoverAt(s.x, s.y);
    const tip = document.querySelector('.map__tip');
    return { screen: s, tipText: tip ? tip.innerText.slice(0, 200) : null, describe: m.describe('hawaii') };
  })));

  log('florida pick ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map;
    const s = m.unitScreen('us-florida');
    if (!s) return 'no screen';
    return { screen: s, pick: m.pick(s.x, s.y) };
  })));

  log('undrawable ' + JSON.stringify(await page.evaluate(() => {
    const c = document.querySelector('.map__switchbody');
    return { text: c ? c.innerText : null };
  })).slice(0, 1500));
  await shot('y1900');

  // stitching
  await page.evaluate(() => window.BEA.map.setStitch(true));
  await page.waitForTimeout(900);
  log('stitch net ' + JSON.stringify(await page.evaluate(() => {
    const n = window.BEA.map.net;
    return n ? { links: (n.links||[]).length, km: n.km, nodes: (n.nodes||[]).length, keys: Object.keys(n) } : null;
  })));
  await shot('stitch');
  await page.evaluate(() => window.BEA.map.setStitch(false));
};
