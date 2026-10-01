/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.cx-cta');
  await page.waitForTimeout(1200);
  const seen = [];
  for (let i = 1; i <= 40; i++) {
    const st = await page.evaluate(() => {
      const q = s => { const e = document.querySelector(s); return e ? e.innerText.trim().replace(/\s+/g,' ') : null; };
      const nx = document.querySelector('.tr-bar__next');
      const panel = document.querySelector('.tr-panel, .cx-panel, [class*=panel]');
      return {
        count: q('.tr-bar'),
        headline: q('.cx-head, .cx-say, [class*=head]'),
        nextDisabled: nx ? nx.disabled : null,
        panelText: panel ? panel.innerText.replace(/\s+/g,' ').slice(0,1400) : null,
        cloze: q('.cl-line, [class*=cl-]'),
        year: q('.tl-year, [class*=year]'),
      };
    });
    log('### STEP ' + i + ' | ' + (st.count||'').replace(/\n/g,' '));
    log('  YEAR: ' + st.year);
    log('  PANEL: ' + (st.panelText||'').slice(0,1100));
    if (st.nextDisabled) {
      // try to satisfy a gate / dispute / recall
      const acted = await page.evaluate(() => {
        const c = document.querySelector('.tr-field__cell');
        if (c) { c.click(); return 'gate-cell'; }
        const b = document.querySelector('[class*=commit],[class*=guess],[class*=answer] button, .qz-opt, .dp-opt');
        if (b) { b.click(); return 'other:'+b.className; }
        return null;
      });
      log('  GATE-ACTION: ' + acted);
      await page.waitForTimeout(600);
      // maybe a second stage
      const acted2 = await page.evaluate(() => {
        const n = document.querySelector('.tr-bar__next');
        if (n && !n.disabled) return 'unblocked';
        const els = [...document.querySelectorAll('button')].filter(b=>!b.disabled && /place|commit|settle|that is my|confirm|lock/i.test(b.textContent));
        if (els.length) { els[0].click(); return 'clicked:'+els[0].textContent.trim().slice(0,40); }
        return 'still-blocked';
      });
      log('  GATE-ACTION2: ' + acted2);
      await page.waitForTimeout(700);
    }
    if ([1,5,9,12,14,18,20,23,24].includes(i)) await shot('w'+String(i).padStart(2,'0'));
    const moved = await page.evaluate(() => {
      const n = document.querySelector('.tr-bar__next');
      if (!n || n.disabled) return false; n.click(); return true;
    });
    if (!moved) { log('!!! STUCK at step ' + i); await shot('stuck'+i); break; }
    await page.waitForTimeout(800);
  }
  await shot('final');
};
