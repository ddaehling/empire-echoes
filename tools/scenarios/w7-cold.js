/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** w7-cold.js — cold step links, and the aux control at 390. */
module.exports = async ({ page, shot, log }) => {
  for (const step of [3, 7, 16]) {
    await page.goto('http://localhost:8777/app/#tour=core&step=' + step, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const box = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
      const aux = document.querySelector('.tr-bar__aux');
      const auxb = document.querySelector('.tr-bar__auxb');
      return {
        count: document.querySelector('.tr-bar__count')?.textContent || '',
        title: document.querySelector('.cx-sheet__title')?.textContent || '',
        onpath: !!document.querySelector('.viz-onpath'),
        onpathBox: box(document.querySelector('.viz-onpath')),
        auxDisplay: aux ? getComputedStyle(aux).display : '(no node)',
        auxBox: box(aux), auxbBox: box(auxb), auxbText: auxb ? auxb.textContent.trim() : null,
        entryDisplay: document.querySelector('.viz-entry') ? getComputedStyle(document.querySelector('.viz-entry')).display : '(no node)',
        entryOffsetParent: document.querySelector('.viz-entry') ? !!document.querySelector('.viz-entry').offsetParent : null,
        t3: /3\.4\s?million|embarked/i.test(document.body.innerText),
      };
    });
    log('COLD step=' + step + ' ' + JSON.stringify(r));
    await shot('cold-' + step);
  }
};
