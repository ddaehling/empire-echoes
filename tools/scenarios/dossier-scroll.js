/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 — read the whole dossier, top to bottom, in whatever theme/viewport the
 * harness is set to. Use with --dark, --mobile, --reduced.
 *   node tools/inspect.js tools/scenarios/dossier-scroll.js --out /tmp/dsr-scroll --dark
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.addStyleTag({ content: `
    .app { height: 100dvh !important; max-height: 100dvh !important; }
    .app__stage { overflow: hidden !important; min-height: 0 !important; }
    .stage__map { overflow: hidden !important; height: 100% !important; }` });
  await page.evaluate(() => { BEA.store.batch(d => { d('setYear', 1913); d('select', 'egypt'); }); BEA.store.flush(); });
  await page.waitForTimeout(500);
  const h = await page.evaluate(() => {
    const p = document.querySelector('.app__dossier');
    return { scrollHeight: p.scrollHeight, clientHeight: p.clientHeight };
  });
  log('dossier scroll height:', JSON.stringify(h));
  const steps = Math.min(8, Math.ceil(h.scrollHeight / h.clientHeight));
  for (let i = 0; i < steps; i++) {
    await page.evaluate((n) => {
      const p = document.querySelector('.app__dossier');
      p.scrollTop = n * (p.clientHeight - 40);
    }, i);
    await page.waitForTimeout(250);
    await shot('scroll-' + i, '.app__dossier');
  }
  log('contrast probe:', JSON.stringify(await page.evaluate(() => {
    const pick = (s) => { const e = document.querySelector(s); if (!e) return null;
      const c = getComputedStyle(e); return { color: c.color, bg: c.backgroundColor, size: c.fontSize }; };
    return { body: pick('.dossier'), prose: pick('.dsr__prose'), defect: pick('.defect'),
      srcV: pick('.src__v'), quote: pick('.src__quote p'), micro: pick('.dsr__k') };
  })));
};
