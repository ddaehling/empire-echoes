/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p03x-fit.js — is the bar inside its budget at every stage? */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  const probe = async (label) => {
    const m = await page.evaluate(() => {
      const tl = document.querySelector('.tl');
      const time = document.querySelector('.app__time');
      const say = document.querySelector('.cx-lede__say');
      const r = (e) => { const b = e.getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height) }; };
      const kids = [...tl.children].map(e => ({ c: e.className, ...r(e) }));
      const deep = ['.tl__transport', '.tl__now', '.tl-ax', '.tl-ax__marks', '.tl-spine', '.tl__warn', '.tl-speed']
        .map(s => { const e = document.querySelector(s); return [s, e ? r(e) : null]; });
      let words = 0, ctrls = 0; const sizes = {};
      const w = document.createTreeWalker(time, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) {
        const t = n.nodeValue.trim(); if (!t) continue;
        const el = n.parentElement; const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || !b.height) continue;
        words += t.split(/\s+/).length; const f = Math.round(parseFloat(cs.fontSize)); sizes[f] = (sizes[f]||0)+1;
      }
      ctrls = [...time.querySelectorAll('button,select,[tabindex]:not([tabindex="-1"])')].filter(e => { const b = e.getBoundingClientRect(); return b.width>0 && b.height>0; }).length;
      const tb = time.getBoundingClientRect();
      let overflow = 0;
      for (const e of time.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.height && b.bottom > tb.bottom + 1) overflow = Math.max(overflow, Math.round(b.bottom - tb.bottom)); }
      return {
        stage: document.documentElement.dataset.stage,
        timeH: Math.round(tb.height),
        tlH: Math.round(tl.getBoundingClientRect().height), tlScrollH: tl.scrollHeight,
        clipped: tl.scrollHeight > tl.clientHeight + 1,
        overflowPx: overflow,
        kids, deep: Object.fromEntries(deep),
        words, ctrls, sizes,
        sayClipped: say ? say.scrollHeight > say.clientHeight + 1 : null,
        docScroll: document.documentElement.scrollHeight, inner: innerHeight,
      };
    });
    log(label + ' ' + JSON.stringify(m));
  };
  await probe('plate');
  await shot('plate');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(700);
  await probe('working');
  await shot('working');
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(700);
  await probe('apparatus');
  await shot('apparatus');
};
