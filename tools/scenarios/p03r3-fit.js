/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P03 round 3 — the time bar measured at three stages, against LAYOUT_BUDGET §2. */
const CAP = { 390: 190, 1024: 130, 1366: 146, 1440: 158, 1920: 170 };

module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(900);

  const probe = async (label) => page.evaluate((label) => {
    const q = (s) => document.querySelector(s);
    const box = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), t: Math.round(b.top), b: Math.round(b.bottom) }; };
    const region = box(q('.app__time'));
    const tl = box(q('.tl'));
    const vis = (n) => { const b = n.getBoundingClientRect(); const cs = getComputedStyle(n); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !n.hidden; };
    const tabbable = [...document.querySelectorAll('.tl button:not([tabindex="-1"]), .tl select, .tl [tabindex="0"], .tl a[href]')].filter(vis);
    // overflow of any tl child beyond the region
    const over = [];
    if (region) for (const n of document.querySelectorAll('.tl *')) {
      if (!vis(n)) continue;
      const b = n.getBoundingClientRect();
      if (b.bottom > region.b + 1 || b.top < region.t - 1 || b.right > innerWidth + 1) over.push(n.className + ' [' + Math.round(b.top) + ',' + Math.round(b.bottom) + ']');
    }
    const sizes = new Set();
    for (const n of document.querySelectorAll('.tl *')) {
      if (!vis(n)) continue;
      if ([...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) sizes.add(parseFloat(getComputedStyle(n).fontSize));
    }
    const words = (q('.tl') ? q('.tl').innerText : '').trim().split(/\s+/).filter(Boolean).length;
    return {
      label, stage: document.documentElement.dataset.stage,
      region, tl, tabbable: tabbable.length,
      tabLabels: tabbable.map(n => (n.getAttribute('aria-label') || n.textContent || '').trim().slice(0, 26)),
      over: over.slice(0, 8), sizes: [...sizes].sort((a, b) => a - b), words,
      lede: (q('.cx-lede__say') ? q('.cx-lede__say').textContent : '').slice(0, 130),
      ledeClipped: q('.cx-lede__say') ? (q('.cx-lede__say').scrollHeight > q('.cx-lede__say').clientHeight + 1) : null,
      doc: document.documentElement.scrollHeight, innerH: innerHeight,
    };
  }, label);

  const rows = [];
  rows.push(await probe('plate'));
  await shot('plate');

  // first interaction: +1
  await page.click('.tl-btn[aria-label="Forward one year"]');
  await page.waitForTimeout(900);
  rows.push(await probe('working'));
  await shot('working');

  // apparatus, via the app's own state
  await page.evaluate(() => { location.hash = '#year=1901&filter=stage:apparatus'; });
  await page.waitForTimeout(1200);
  rows.push(await probe('apparatus'));
  await shot('apparatus');

  const cap = CAP[Math.round(await page.evaluate(() => innerWidth))] || 190;
  for (const r of rows) {
    const h = r.region ? r.region.h : -1;
    const ok = h <= cap && (!r.tl || r.tl.h <= h + 1) && !r.over.length && r.doc <= r.innerH;
    log(`${ok ? 'PASS' : 'FAIL'} ${r.label} stage=${r.stage} region=${h}/${cap} tl=${r.tl && r.tl.h} tabstops=${r.tabbable} words=${r.words} sizes=${r.sizes.join(',')} doc=${r.doc}/${r.innerH} ledeClipped=${r.ledeClipped}`);
    log('   tabs: ' + r.tabLabels.join(' | '));
    if (r.over.length) log('   OVERFLOW: ' + r.over.join(' ;; '));
    log('   lede: ' + r.lede);
  }
};
