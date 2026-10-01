/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p03x-before.js — what P03 asks for with the shell's shim neutralised. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  const unshim = async () => page.addStyleTag({ content: `
    #app .tl__changes, #app .tl-rate, #app .tl-spine__foot { display: flex !important; }
    #app[data-stage] .tl-ax__marks, #app[data-stage] .tl__warn, #app[data-stage] .tl-speed,
    #app[data-stage] .tl-btn--big, #app[data-stage] .tl-btn--jump { display: revert !important; }
    #app .tl__drawer:not([hidden]) { position: static !important; block-size: auto !important; min-block-size: 0 !important; box-shadow: none !important; }
    @media (min-width: 62.0625rem) { #app .tl { grid-template-areas: "deck changes" "body body" "drawer drawer" !important; } }
  ` });

  const probe = async (label) => {
    const m = await page.evaluate(() => {
      const tl = document.querySelector('.tl');
      const time = document.querySelector('.app__time');
      const r = (s) => { const e = document.querySelector(s); if (!e) return 0; const b = e.getBoundingClientRect(); return Math.round(b.height); };
      const need = tl ? Math.round(tl.scrollHeight) : 0;
      // natural height: sum of grid rows content
      const rows = ['.tl__deck', '.tl__changes', '.tl__body', '.tl__drawer'].map(s => {
        const e = document.querySelector(s); if (!e) return [s, 0];
        return [s, Math.round(e.scrollHeight)];
      });
      return {
        vw: innerWidth, vh: innerHeight,
        timeH: r('.app__time'), tlH: r('.tl'), tlScrollH: need,
        rows: Object.fromEntries(rows),
        clipped: tl ? tl.scrollHeight > tl.clientHeight + 1 : false,
        drawerOpen: !!document.querySelector('.tl__drawer:not([hidden])'),
      };
    });
    log(label + ' ' + JSON.stringify(m));
  };

  await unshim();
  await page.waitForTimeout(300);
  await probe('BEFORE-plate');
  await page.keyboard.press('2'); await page.waitForTimeout(700);
  await probe('BEFORE-after2');
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(600);
  await probe('BEFORE-apparatus');
  // open the drawer
  const card = await page.$('.tl-chg:not(.tl-chg--more)');
  if (card) { await card.click(); await page.waitForTimeout(600); await probe('BEFORE-drawer'); }
  await shot('before-unshimmed');
};
