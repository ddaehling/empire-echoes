/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* ROUND 7 — the warrant line under a figure a student meets, light and dark,
   phone and desk. */
module.exports = async ({ page, shot, log }) => {
  const cases = [['ireland', 1852], ['british-india', 1799], ['jamaica', 1655], ['barbados', 1836]];
  for (const [id, year] of cases) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const b = await page.$('.dossier__body button.dsr__idxbtn:has-text("Every step of the taking")');
    if (b) { await b.click(); await page.waitForTimeout(700); }
    const r = await page.evaluate(() => {
      const out = { ok: 0, defect: 0, lines: [] };
      for (const n of document.querySelectorAll('.wq__defect, .wq__w')) {
        if (n.classList.contains('wq__defect')) out.defect++; else out.ok++;
        out.lines.push((n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 250));
      }
      const el = document.querySelector('.wq__w');
      if (el) el.scrollIntoView({ block: 'center' });
      return out;
    });
    log('--- ' + id + ' --- warranted=' + r.ok + ' defect=' + r.defect + '\n  ' + r.lines.join('\n  '));
    await page.waitForTimeout(250);
    await shot('w2-' + id);
  }
};
