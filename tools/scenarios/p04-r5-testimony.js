/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 5 — the primary texts and their provenance. */
module.exports = async ({ page, shot, log }) => {
  const check = async (sel, year, label) => {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + sel, { waitUntil: 'load' });
    await page.waitForTimeout(2600);
    const r = await page.evaluate(() => {
      const blk = document.querySelector('#dsr-testimony');
      const srcs = [...document.querySelectorAll('.app__dossier figure.src')];
      const prim = srcs.filter((s) => s.dataset.primary === 'yes');
      return {
        block: !!blk,
        heading: blk ? (blk.querySelector('.dsr__eyebrow') || {}).textContent : null,
        primaries: prim.length,
        allSrc: srcs.length,
        defects: [...document.querySelectorAll('.app__dossier .defect')].map((d) => d.textContent).slice(0, 6),
        absence: !!document.querySelector('.dsr__absence'),
        firstQuote: prim[0] ? (prim[0].querySelector('.src__quote') || {}).textContent : null,
        /* provenance must precede the quote in DOM order and be the same size */
        order: prim[0] ? (() => {
          const kids = [...prim[0].children].map((k) => k.className);
          const dl = kids.indexOf('src__nop'), q = kids.findIndex((c) => c.startsWith('src__quote'));
          const dd = prim[0].querySelector('.src__v'), qq = prim[0].querySelector('.src__quote p');
          return { dlIndex: dl, quoteIndex: q, ddSize: dd && getComputedStyle(dd).fontSize, qSize: qq && getComputedStyle(qq).fontSize };
        })() : null,
        gate: (() => {
          const g = document.querySelector('.src__v[data-gate="yes"]');
          if (!g) return null;
          const inPrimary = !!g.closest('figure.src[data-primary="yes"]');
          return { inPrimary, q: (g.querySelector('.dsr__askqt') || {}).textContent, choices: g.querySelectorAll('.dsr__choice').length };
        })(),
        check: [...document.querySelectorAll('.app__dossier .src__check')].length,
        shapeNote: (document.querySelector('.dsr__shapenote') || {}).textContent,
      };
    });
    log(label + ' :: ' + JSON.stringify(r, null, 1));
  };
  await check('bengal-presidency', 1765, 'BENGAL 1765');
  await shot('bengal-testimony');
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(400);
  await shot('bengal-testimony-scrolled');
  await check('new-zealand', 1840, 'NEW ZEALAND 1840');
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(400);
  await shot('nz-waitangi');
  await check('kenya', 1955, 'KENYA 1955');
  await check('nevis', 1800, 'NEVIS 1800 (expect absence)');
  await page.evaluate(() => { const n = document.querySelector('#dsr-testimony'); if (n) n.scrollIntoView(); });
  await page.waitForTimeout(400);
  await shot('nevis-absence');
};
