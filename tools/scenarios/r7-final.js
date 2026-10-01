/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const cases = [['haiti', 1794], ['corsica', 1794], ['heligoland', 1807], ['cape-coast-castle', 1664], ['elmina', 1872], ['new-york', 1664]];
  for (const [id, year] of cases) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(650);
    const out = await page.evaluate(() => {
      const d = document.querySelector('.dossier__body');
      if (!d) return { miss: true };
      const lines = d.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
      const i = lines.findIndex((l) => /^How it (was|happened|changed)|^Who (signed|joined|granted)|^What was lost/i.test(l));
      return { block: i >= 0 ? lines.slice(i, i + 7) : lines.slice(0, 7) };
    });
    log('--- ' + id + ' ---\n  ' + (out.miss ? 'NO DOSSIER' : out.block.join('\n  ')));
  }
  await shot('r7-final');
};
