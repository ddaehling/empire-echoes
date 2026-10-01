/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 ROUND 6 — every layer, every chip kind: the printed word against the
   spoken name, on all fourteen registered layers, at two years. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  const layers = await page.evaluate(() => Object.keys(window.BEA.symbology.LAYER_MEANING));
  log('layers: ' + layers.length + ' — ' + layers.join(', '));
  const fails = [];
  const norm = s => String(s).toLowerCase().replace(/[‘’']/g, "'").replace(/[—–·:;,.…()→▸▾+\-\/]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const year of [1780, 1900, 1947]) {
    for (const L of layers) {
      await page.evaluate((h) => { location.hash = h; }, `#year=${year}&layer=${L}`);
      await page.waitForTimeout(650);
      const rows = await page.evaluate(() => {
        const out = [];
        for (const li of document.querySelectorAll('.legend__rib')) {
          if (li.hidden) continue;
          const w = li.querySelector('.legend__rib-w'); const n = li.querySelector('.legend__rib-n');
          out.push({ word: w ? w.textContent.trim() : '', num: n ? n.textContent.trim() : '',
            say: li.getAttribute('aria-label') || '' });
        }
        const r = document.querySelector('.legend__route');
        const say = document.querySelector('.legend__say');
        return { rows: out, route: r && !r.hidden ? { text: r.textContent.trim(), say: r.getAttribute('aria-label') || '' } : null,
          sentence: say ? say.textContent.trim() : null };
      });
      const bad = [];
      for (const r of rows.rows) {
        const seen = (r.word + ' ' + r.num).trim();
        if (!r.say) { bad.push('chip "' + seen + '" has NO NAME'); continue; }
        if (!norm(r.say).includes(norm(seen))) bad.push('chip seen "' + seen + '" said "' + r.say.slice(0, 70) + '"');
      }
      if (rows.route && !norm(rows.route.say).includes(norm(rows.route.text))) {
        bad.push('route seen "' + rows.route.text + '" said "' + rows.route.say.slice(0, 70) + '"');
      }
      log(year + ' ' + L.padEnd(14) + ' ' + String(rows.rows.length).padStart(2) + ' chips  ' +
        (rows.route ? '[' + rows.route.text + '] ' : '') + (bad.length ? '*** ' + bad.join(' | ') : 'ok') +
        (rows.sentence === null ? '  (no sentence printed)' : ''));
      bad.forEach(b => fails.push(year + ' ' + L + ': ' + b));
    }
  }
  log('');
  log('=== label-in-name failures across every layer: ' + fails.length + ' ===');
  fails.forEach(f => log('   FAIL ' + f));
  log(fails.length ? '>>> LEGEND NAMING BROKEN' : '>>> every chip on every layer says the word it prints');
};
