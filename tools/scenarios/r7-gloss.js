/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* ROUND 7 — read the counterparty labels the dossier actually prints, for the
   territories whose roles were tagged this wave, plus the map size. */
module.exports = async ({ page, shot, log }) => {
  const cases = [
    ['new-york', 1664], ['jamaica', 1655], ['us-virgin-islands', 1801],
    ['ascension', 1815], ['macau-1808', 1808], ['minorca', 1708],
    ['jammu-and-kashmir', 1846], ['falkland-islands', 1833], ['balambangan', 1803],
    ['cape-colony', 1795], ['trinidad', 1797], ['guyana', 1796],
    ['bougainville', 1914], ['goa-british-garrison', 1799], ['british-moluccas', 1796],
    ['rio-de-la-plata-invasions', 1806], ['libya-british-administration', 1943],
    ['madagascar-british-occupation', 1942], ['reunion-british-occupation', 1810],
    ['canton-and-enderbury', 1939], ['tristan-da-cunha', 1816],
    ['ireland', 1852], ['barbados', 1836], ['british-india', 1799], ['sindh', 1843],
  ];
  for (const [id, year] of cases) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const out = await page.evaluate(() => {
      const d = document.querySelector('.dossier__body') || document.querySelector('.dossier');
      if (!d) return { miss: true };
      const lines = d.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
      const i = lines.findIndex((l) => /^How it (was|happened|changed)|^Who (signed|joined|granted)/i.test(l));
      const warr = lines.filter((l) => /^(No source for this figure|Check this figure|Figure from)/i.test(l));
      return { block: i >= 0 ? lines.slice(i, i + 9) : lines.slice(0, 9), warr: warr.length, w0: warr[0] || '' };
    });
    log('--- ' + id + ' ' + year + ' ---\n  ' + (out.miss ? 'NO DOSSIER' : out.block.join('\n  '))
      + (out.warr ? '\n  [warrant lines: ' + out.warr + '] ' + out.w0.slice(0, 110) : ''));
  }
  await shot('r7-dossier-1440');
};
