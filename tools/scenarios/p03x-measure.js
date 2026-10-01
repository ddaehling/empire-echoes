/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p03x-measure.js — P03's own budget probe. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  const probe = async (label) => {
    const m = await page.evaluate(() => {
      const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const vw = innerWidth, vh = innerHeight;
      const time = document.querySelector('.app__time');
      const tl = document.querySelector('.tl');
      const strata = {};
      for (const sel of ['.tl__deck', '.tl__transport', '.tl__now', '.tl__changes', '.tl__body', '.tl-ax', '.tl-rate', '.tl-spine', '.tl__drawer', '.tl-ax__marks', '.tl-speed', '.tl__warn', '.tl__changehead']) {
        strata[sel] = box(sel);
      }
      // controls & words inside the time region
      const inTime = (e) => time && time.contains(e);
      const ctrls = [...document.querySelectorAll('button,a[href],select,input,[tabindex]:not([tabindex="-1"])')]
        .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < vh && b.bottom > 0; });
      const tctrls = ctrls.filter(inTime);
      let words = 0; const sizes = {};
      if (time) {
        const w = document.createTreeWalker(time, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) {
          const t = n.nodeValue.trim(); if (!t) continue;
          const el = n.parentElement; if (!el) continue;
          const b = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          if (!b.width || !b.height || b.top >= vh || b.bottom <= 0) continue;
          words += t.split(/\s+/).length;
          const fs = Math.round(parseFloat(cs.fontSize)); sizes[fs] = (sizes[fs] || 0) + 1;
        }
      }
      return {
        vw, vh,
        stage: box('.app__stage'), key: box('.stage__key'),
        map: box('.stage__map canvas') || box('.stage__map svg'),
        time: time ? { ...box('.app__time'), scrollH: time.scrollHeight, clientH: time.clientHeight } : null,
        tl: tl ? { ...box('.tl'), scrollH: tl.scrollHeight, offsetH: tl.offsetHeight } : null,
        strata,
        timeControls: tctrls.length, allControls: ctrls.length,
        timeWords: words, timeSizes: sizes,
        stageAttr: document.documentElement.dataset.stage || null,
        docScroll: document.documentElement.scrollHeight, inner: innerHeight,
        cssTimeH: getComputedStyle(document.documentElement).getPropertyValue('--time-h').trim(),
      };
    });
    log(label + ' ' + JSON.stringify(m, null, 1));
    return m;
  };

  await probe('PLATE');
  await shot('plate');

  // press 2 → definition change
  await page.keyboard.press('2');
  await page.waitForTimeout(900);
  await probe('AFTER-2');
  await shot('after2');

  // go to apparatus
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(900);
  await probe('APPARATUS');
  await shot('apparatus');
};
