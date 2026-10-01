/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 3 — measure the time bar against docs/LAYOUT_BUDGET.md §2. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);

  const m = async (label) => page.evaluate((label) => {
    const r = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top), b: Math.round(b.bottom) }; };
    const time = r('.app__time');
    const tl = r('.tl');
    const vis = (n) => { const b = n.getBoundingClientRect(); const cs = getComputedStyle(n); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const controls = [...document.querySelectorAll('.tl button, .tl select, .tl input, .tl [tabindex="0"], .tl a[href]')].filter(vis);
    const clipped = tl && time ? (tl.h > time.h + 1) : false;
    const words = (document.querySelector('.tl') ? document.querySelector('.tl').innerText : '').trim().split(/\s+/).filter(Boolean).length;
    const sizes = new Set();
    if (document.querySelector('.tl')) for (const n of document.querySelectorAll('.tl *')) { if (n.childNodes.length && [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) sizes.add(getComputedStyle(n).fontSize); }
    const scrollers = [...document.querySelectorAll('.tl, .tl *')].filter(n => n.scrollHeight > n.clientHeight + 2 || n.scrollWidth > n.clientWidth + 2).map(n => n.className + ' ' + n.scrollHeight + '/' + n.clientHeight);
    return {
      label, stage: document.documentElement.dataset.stage, time, tl, clipped,
      controls: controls.length, controlLabels: controls.map(n => (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 34)),
      words, sizes: [...sizes].sort(), scrollers,
      docScroll: document.documentElement.scrollHeight, innerH: innerHeight,
    };
  }, label);

  const out = [];
  out.push(await m('plate'));
  await shot('plate');

  // touch the atlas -> working
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  out.push(await m('working'));
  await shot('working');

  // apparatus
  await page.evaluate(() => { const a = window.__app || window.app; });
  await page.evaluate(() => { document.dispatchEvent(new CustomEvent('x')); });
  await page.evaluate(() => {
    const bus = (window.__bus || (window.app && window.app.bus));
    if (bus) bus.emit('ask:stage', { level: 'apparatus' });
    else location.hash = '#year=1901&filter=stage:apparatus';
  });
  await page.waitForTimeout(900);
  out.push(await m('apparatus'));
  await shot('apparatus');

  for (const o of out) {
    log(`--- ${o.label} stage=${o.stage} time=${o.time && o.time.h} tl=${o.tl && o.tl.h} clipped=${o.clipped} controls=${o.controls} words=${o.words} sizes=${o.sizes.join(',')} doc=${o.docScroll}/${o.innerH}`);
    log('    controls: ' + o.controlLabels.join(' | '));
    if (o.scrollers.length) log('    scrollers: ' + o.scrollers.join(' ;; '));
  }
};
