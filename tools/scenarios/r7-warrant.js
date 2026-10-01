/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const [id, year] of [['sindh', 1843], ['ireland', 1852], ['northern-territory', 1929], ['cayman-islands', 1834], ['new-york', 1783]]) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    // answer every prediction gate so the record opens
    for (let i = 0; i < 4; i++) {
      const b = await page.$('.dossier__body button:has-text("I am not sure")');
      if (!b) break;
      await b.click(); await page.waitForTimeout(400);
    }
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const out = { defects: 0, ok: 0, weak: 0, lines: [] };
      for (const n of document.querySelectorAll('.wq__defect, .wq__w')) {
        const s = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (n.classList.contains('wq__defect')) out.defects++;
        else if (n.dataset.status === 'weak') out.weak++; else out.ok++;
        out.lines.push(s.slice(0, 230));
      }
      const el = document.querySelector('.wq__w') || document.querySelector('.wq__defect');
      if (el) el.scrollIntoView({ block: 'center' });
      return out;
    });
    log('--- ' + id + ' --- ok=' + r.ok + ' weak=' + r.weak + ' defect=' + r.defects + '\n  ' + r.lines.join('\n  '));
    await page.waitForTimeout(300);
    await shot('warrant-' + id);
  }
};
