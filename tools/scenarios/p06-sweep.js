/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p06-sweep.js — every registered reading, at one viewport, checked for the
 * three ways a re-encoding goes wrong in the layout rather than in the data.
 *
 *   node tools/inspect.js tools/scenarios/p06-sweep.js --out /tmp/sw390  --mobile
 *   node tools/inspect.js tools/scenarios/p06-sweep.js --out /tmp/sw900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/p06-sweep.js --out /tmp/sw1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p06-sweep.js --out /tmp/sw1440 --w 1440 --h 900
 *   …and each of those with --dark and with --reduced.
 *
 * It walks the catalog rather than a list written here, so a reading added
 * later is swept without this file being edited. Per reading it asserts:
 *   S1  no single-line run in this piece's own surfaces is clipped
 *   S2  the document does not scroll, in either axis (LAYOUT_BUDGET B4)
 *   S3  the key card stays inside the stage rectangle (LAYOUT_BUDGET B5, B10)
 * Prints `>>> layers sweep holds` / `>>> LAYERS SWEEP BROKEN`.
 */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    window.BEA.store.dispatch('setYear', 1913);
    window.BEA.bus.emit('ask:stage', { level: 'apparatus' });
  });
  await page.waitForTimeout(700);

  const ids = await page.evaluate(async () => (await import('/app/js/layers/catalog.js')).LAYERS.map((l) => l.id));
  const bad = [];
  for (const id of ids) {
    await page.evaluate((x) => window.BEA.bus.emit('ask:layer', { id: x, predict: false }), id);
    await page.waitForTimeout(800);
    const r = await page.evaluate((x) => {
      const out = { id: x, clip: [], overflowX: false, docScroll: false, key: 'none' };
      for (const n of document.querySelectorAll('.ly-bar *, .ly-key *, .ly-caption *, .cx-lede__say, .cx-lede__mark')) {
        if (!n.textContent || n.children.length) continue;
        const cs = getComputedStyle(n);
        if (cs.overflow === 'visible' && cs.overflowX === 'visible') continue;
        if (n.scrollWidth > n.clientWidth + 1) out.clip.push(n.className + ' :: ' + n.textContent.slice(0, 46));
      }
      out.overflowX = document.documentElement.scrollWidth > innerWidth;
      out.docScroll = document.documentElement.scrollHeight > innerHeight;
      const k = document.querySelector('.ly-key');
      const st = document.querySelector('.app__stage');
      if (k && st) {
        const a = k.getBoundingClientRect(); const b = st.getBoundingClientRect();
        out.key = (a.bottom > b.bottom + 2 || a.top < b.top - 2 || a.right > b.right + 2) ? 'OUTSIDE THE STAGE' : 'ok';
      }
      return out;
    }, id);
    if (r.clip.length || r.overflowX || r.docScroll || r.key === 'OUTSIDE THE STAGE') bad.push(r);
  }
  log(bad.length ? 'DEFECTS ' + JSON.stringify(bad, null, 1) : 'clean across all ' + ids.length + ' readings');
  await page.evaluate(() => window.BEA.bus.emit('ask:layer', { id: 'taken-from', predict: false }));
  await page.waitForTimeout(700);
  await shot('taken-from');
  log(bad.length ? '>>> LAYERS SWEEP BROKEN' : '>>> layers sweep holds');
};
