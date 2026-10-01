/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const [id, year] of [['sindh', 1843], ['ireland', 1852], ['northern-territory', 1929], ['new-york', 1783], ['barbados', 1836]]) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const go = await page.$('.dossier__body button:has-text("go to it")');
    if (go) { await go.click(); await page.waitForTimeout(600); }
    // the toll gate: click any magnitude choice
    for (let i = 0; i < 3; i++) {
      const b = await page.$('.dossier__body .tb__opt, .dossier__body button[data-mag], .dossier__body .dsr__tollopt');
      if (!b) break;
      await b.click(); await page.waitForTimeout(500);
    }
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const out = { ok: 0, weak: 0, defect: 0, lines: [] };
      for (const n of document.querySelectorAll('.wq__defect, .wq__w')) {
        if (n.classList.contains('wq__defect')) out.defect++;
        else if (n.dataset.status === 'weak') out.weak++; else out.ok++;
        out.lines.push((n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 240));
      }
      const btns = [...document.querySelectorAll('.dossier__body button')].map((b) => (b.className || '') + '|' + (b.textContent || '').replace(/\s+/g,' ').trim().slice(0, 40));
      const el = document.querySelector('.wq__w') || document.querySelector('.wq__defect');
      if (el) el.scrollIntoView({ block: 'center' });
      return { ...out, btns: btns.slice(0, 14) };
    });
    log('--- ' + id + ' --- ok=' + r.ok + ' weak=' + r.weak + ' defect=' + r.defect
      + (r.lines.length ? '\n  ' + r.lines.join('\n  ') : '\n  BUTTONS: ' + r.btns.join(' ;; ')));
    await shot('toll-' + id);
  }
};
