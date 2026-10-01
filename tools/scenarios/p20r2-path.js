/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20r2-path — the four moves must be reachable from inside the 30-minute path. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const beats = ['compensation', 'princely', 'egypt', 'exits'];
  for (let i = 0; i < beats.length; i++) {
    const id = beats[i];
    await page.evaluate((b) => window.BEA.bus.emit('tours:goBeat', { id: b }), id);
    await page.waitForTimeout(900);
    const aux = await page.evaluate(() => {
      const b = document.querySelector('.tr-bar__auxb');
      if (!b) return null;
      const r = b.getBoundingClientRect();
      return { label: b.textContent, x: r.x | 0, y: r.y | 0, w: r.width | 0, h: r.height | 0, vis: r.width > 0 && r.height > 0 };
    });
    t('beat ' + id + ' offers a move', !!(aux && aux.vis && /Move/.test(aux.label)), JSON.stringify(aux));
    if (!aux) continue;
    await page.evaluate(() => document.querySelector('.tr-bar__auxb').click());
    await page.waitForTimeout(700);
    const sheet = await page.evaluate(() => {
      const s = document.querySelector('.cx-sheet');
      const mv = document.querySelector('.tp-mv');
      if (!mv) return { mv: false };
      const r = mv.getBoundingClientRect();
      return {
        mv: true,
        title: s && s.querySelector('.cx-sheet__title') ? s.querySelector('.cx-sheet__title').textContent : null,
        eyebrow: s && s.querySelector('.cx-sheet__eyebrow') ? s.querySelector('.cx-sheet__eyebrow').textContent : null,
        opts: document.querySelectorAll('.tp-mv__opt').length,
        w: r.width | 0, h: r.height | 0,
        words: mv.textContent.trim().split(/\s+/).length,
        src: document.querySelectorAll('.tp-mv__srcq').length,
      };
    });
    t('move ' + (i + 1) + ' opens in the rail sheet', !!(sheet.mv && sheet.opts === 3), JSON.stringify(sheet));
    await shot('move' + (i + 1) + '-' + id);
    /* commit to the good answer and read the response */
    const res = await page.evaluate(() => {
      const bs = [...document.querySelectorAll('.tp-mv__opt')];
      bs[bs.length - 1].click();
      const r = document.querySelector('.tp-mv__result');
      return { shown: r && !r.hidden, verdict: document.querySelector('.tp-mv__verdict')?.textContent,
        good: document.querySelector('.tp-mv__verdict')?.dataset.good,
        out: document.querySelector('.tp-mv__out .cx-more')?.textContent };
    });
    t('move ' + (i + 1) + ' commit reveals', !!(res.shown && res.verdict), JSON.stringify(res));
    await shot('move' + (i + 1) + '-answered');
  }

  /* it does not block Next, and it clears when the beat moves */
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'barbados' }));
  await page.waitForTimeout(700);
  const clear = await page.evaluate(() => ({
    aux: document.querySelector('.tr-bar__auxb')?.textContent || '',
    nextDisabled: document.querySelector('.tr-bar__next')?.disabled,
  }));
  t('no move offered on a beat that has none', !/Move \d/.test(clear.aux || ''), JSON.stringify(clear));

  /* the picks survive a reload */
  await page.reload();
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'egypt' }));
  await page.waitForTimeout(800);
  await page.evaluate(() => { const b = document.querySelector('.tr-bar__auxb'); if (b) b.click(); });
  await page.waitForTimeout(700);
  const memo = await page.evaluate(() => ({
    shown: !!document.querySelector('.tp-mv__result') && !document.querySelector('.tp-mv__result').hidden,
    on: document.querySelectorAll('.tp-mv__opt.is-on').length,
    label: document.querySelector('.tr-bar__auxb')?.textContent,
  }));
  t('a committed move is remembered on return', memo.shown && memo.on === 1 && /✓/.test(memo.label || ''), JSON.stringify(memo));

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
};
