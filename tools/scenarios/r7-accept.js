/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `r7`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: wave 7: the honest re-pricing of every route. */
/* FEATURE_SPEC §2 P04 acceptance tests 1, 2 and 4, re-run after round 7. */
module.exports = async ({ page, shot, log }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  // A1: the fold, on territories retagged this round
  for (const [id, year] of [['new-york', 1664], ['jamaica', 1655], ['macau-1808', 1808], ['heligoland', 1807], ['haiti', 1794]]) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(650);
    const r = await page.evaluate(() => {
      const d = document.querySelector('.dossier__body');
      const box = d.getBoundingClientRect();
      const want = ['LEGAL STATUS', 'HOW IT WAS', 'HOW IT ENDED', 'WHO COULD VOTE'];
      const seen = {};
      for (const n of d.querySelectorAll('*')) {
        const t = (n.textContent || '').trim().toUpperCase();
        for (const w of want) {
          if (seen[w]) continue;
          if (t.startsWith(w) && n.children.length === 0) {
            const b = n.getBoundingClientRect();
            seen[w] = Math.round(b.bottom) <= Math.round(box.bottom) ? 'above the fold' : 'BELOW';
          }
        }
      }
      return { seen, franchise: /who could vote/i.test(d.innerText) };
    });
    log('A1 ' + id + ': ' + JSON.stringify(r));
  }
  // A2: banned strings in the whole rendered dossier
  const BANNED = ['acquired', 'pacified', 'native ', 'unrest', 'mixed legacy'];
  let hits = 0;
  for (const [id, year] of [['new-york', 1664], ['jamaica', 1655], ['us-virgin-islands', 1801], ['minorca', 1708], ['goa-british-garrison', 1799], ['heligoland', 1807], ['cape-coast-castle', 1664], ['corsica', 1794], ['haiti', 1794], ['macau-1808', 1808], ['bougainville', 1914], ['balambangan', 1803]]) {
    await page.goto('http://localhost:8777/app/#year=' + year + '&sel=' + id, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const bad = await page.evaluate((B) => {
      const t = document.querySelector('.dossier__body').innerText;
      const out = [];
      for (const w of B) {
        const re = new RegExp('[^“"]{0,40}\\b' + w.trim() + '\\b[^”"]{0,40}', 'gi');
        for (const m of t.match(re) || []) out.push(w + ' :: ' + m.replace(/\s+/g, ' '));
      }
      return out;
    }, BANNED);
    if (bad.length) { hits += bad.length; log('A2 ' + id + ' HITS:\n   ' + bad.join('\n   ')); }
  }
  log('A2 total banned-word hits across 12 retagged dossiers: ' + hits);
  // A4: Egypt's four labels
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await page.goto('http://localhost:8777/app/#year=' + y + '&sel=egypt', { waitUntil: 'load' });
    await page.waitForTimeout(550);
    labels.push(await page.evaluate(() => {
      const d = document.querySelector('.dossier__body').innerText.split('\n').map((s) => s.trim()).filter(Boolean);
      const i = d.findIndex((l) => /^LEGAL STATUS/i.test(l));
      return i >= 0 ? d[i + 1] : '(none)';
    }));
  }
  log('A4 Egypt 1882/1914/1922/1956: ' + JSON.stringify(labels) + '  distinct=' + new Set(labels).size);
  await shot('r7-accept');
};
