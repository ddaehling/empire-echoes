/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 — the paper key. Runs teacher/print.js's own swatch-finding algorithm
   against the live strip and reports any row it cannot colour. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(900);
  const run = () => page.evaluate(() => {
    const host = document.querySelector('[data-mount="legend"]');
    const items = [...host.querySelectorAll('li')];
    return items.map((li) => {
      let colour = null;
      for (const n of li.querySelectorAll('*')) {
        const r = n.getBoundingClientRect();
        if (r.width > 40 || r.width < 2) continue;
        const bg = getComputedStyle(n).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { colour = bg; break; }
      }
      return { text: (li.textContent || '').trim().replace(/\s+/g, ' '), hidden: li.hidden, colour };
    });
  });
  const before = await run();
  log('PAPER KEY rows=' + before.length + ' without a swatch: ' + JSON.stringify(before.filter(r => !r.colour)));
  log('ROWS ' + JSON.stringify(before));
  const geom = await page.evaluate(() => {
    const l = document.querySelector('.legend__ribbon-list');
    return { clientW: l.clientWidth, scrollW: l.scrollWidth, docScroll: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  log('LIST ' + JSON.stringify(geom));
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  await shot('print-media');
  await page.emulateMedia({ media: 'screen' });
};
