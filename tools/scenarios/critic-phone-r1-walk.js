/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1800);
  await page.locator('.cx-cta').first().click();
  await page.waitForTimeout(1500);
  for (let i = 1; i <= 24; i++) {
    await page.waitForTimeout(700);
    const info = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const sheet = q('.cx-sheet__body');
      const t = q('.cx-sheet__title');
      const lede = q('.cx-lede__say');
      const yr = q('.cx-lede__mark');
      const tlyr = q('.tl__now');
      const cnt = q('.tr-bar__count');
      return {
        step: cnt ? cnt.innerText.trim().replace(/\s+/g,'') : '?',
        title: t ? t.innerText.trim() : '(none)',
        ledeYear: yr ? yr.innerText.trim() : '',
        lede: lede ? lede.innerText.trim().slice(0,120) : '',
        tl: tlyr ? tlyr.innerText.trim().replace(/\n/g,' ').slice(0,80) : '',
        sheetClient: sheet ? sheet.clientHeight : 0,
        sheetScroll: sheet ? sheet.scrollHeight : 0,
        mapH: q('.stage__map') ? Math.round(q('.stage__map').getBoundingClientRect().height) : 0,
        gate: !!q('.tr-gate, .gate, [class*=gate]'),
      };
    });
    log(`STEP ${info.step} | map ${info.mapH}px | sheet ${info.sheetClient}/${info.sheetScroll} | year ${info.ledeYear} / tl "${info.tl}" | "${info.title}"`);
    log(`   lede: ${info.lede}`);
    await shot('s' + String(i).padStart(2,'0'));
    const nxt = page.locator('.tr-bar__next');
    if (!(await nxt.count())) { log('NO NEXT at ' + i); break; }
    const dis = await nxt.first().isDisabled().catch(()=>false);
    if (dis) { log('NEXT DISABLED at step ' + i + ' — gate?'); 
      const txt = await page.evaluate(()=>document.querySelector('.cx-sheet__body')?.innerText.slice(0,600));
      log('   sheet text: ' + txt);
      break; }
    await nxt.first().click();
  }
};
