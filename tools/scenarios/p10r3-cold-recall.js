/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-cold-recall — land cold on every step of every route and report any
 *  step whose rail says "Not available", plus what a recall card actually
 *  claims to the student on a cold link. */
module.exports = async ({ page, shot, log }) => {
  const base = 'http://localhost:8777/app/';
  const bad = [];
  for (const tour of ['thirty', 'core', 'eight']) {
    for (let s = 1; s <= 26; s++) {
      await page.goto(base + '#tour=' + tour + '&step=' + s, { waitUntil: 'load' });
      await page.waitForTimeout(900);
      const info = await page.evaluate(() => {
        const sheet = document.querySelector('.cx-sheet');
        if (!sheet) return { none: true };
        const g = (s) => { const e = sheet.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
        return {
          eyebrow: g('.cx-sheet__eyebrow'), title: g('.cx-sheet__title'),
          why: g('.qz__why, .qz-why, .cx-note'),
          body: sheet.textContent.replace(/\s+/g, ' ').slice(0, 240),
        };
      });
      if (info.none) continue;
      if (info.title === 'Not available') { bad.push(tour + '#' + s + ' :: ' + info.body); log('NOT AVAILABLE ' + tour + ' step ' + s + ' :: ' + info.body); }
      if (/asked again|checkpoint/.test(info.eyebrow || '')) log(tour + '#' + s + ' RECALL eyebrow=' + info.eyebrow + ' | title=' + info.title + ' | why=' + String(info.why).slice(0, 160));
    }
  }
  log('TOTAL "Not available" steps: ' + bad.length);
};
