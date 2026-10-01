/* shl9-sheet.js — open the sheet from a timeline mark; measure it against B8 (280px). */
module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2300);
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1000);
  const marks = await page.$$('.tl-ax__marks .tl-mark, .tl-ax__marks button, .tl-ax__marks > *');
  log('marks found', marks.length);
  const info = await page.evaluate(() => [...document.querySelectorAll('.tl-ax__marks *')].filter(e => e.getClientRects().length).slice(0, 8).map(e => (typeof e.className === 'string' ? e.className : e.tagName) + ' ' + JSON.stringify(e.getBoundingClientRect().toJSON())));
  log('mark els', JSON.stringify(info, null, 1));
  const m = await page.$('.tl-ax__marks button, .tl-ax__marks [role=button], .tl-mark');
  if (!m) { log('NO MARK'); return; }
  await m.click({ force: true });
  await page.waitForTimeout(1400);
  const r = await page.evaluate(() => {
    const q = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), bottom: +b.bottom.toFixed(1) }; };
    const cs = getComputedStyle(document.documentElement);
    return { sheet: q('.app__sheet'), body: q('.sheet__body'), head: q('.cx-sheet__head'), dossier: q('.app__dossier'),
      sheetMin: cs.getPropertyValue('--cx-sheet-min').trim(), railW: cs.getPropertyValue('--rail-w').trim(),
      vp: [innerWidth, innerHeight], timeH: cs.getPropertyValue('--time-h').trim(),
      time: q('.app__time'), stage: q('.app__stage') };
  });
  log('SHEET', JSON.stringify(r, null, 1));
  await shot('sheet-open');
};
