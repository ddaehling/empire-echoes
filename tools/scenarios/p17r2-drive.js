/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2600);

  const crit = () => page.evaluate(() => {
    const p = document.querySelector('#legend-criticism');
    if (!p) return null;
    return {
      hidden: p.hidden, ch: p.clientHeight, sh: p.scrollHeight,
      atEnd: p.dataset.atEnd,
      items: [...p.querySelectorAll('li strong')].map(e => e.textContent),
    };
  });

  // --- criticism panel ---
  await page.click('.byline__crit');
  await page.waitForTimeout(300);
  await shot('crit-open');
  log('CRIT default ' + JSON.stringify(await crit()));
  const bylineBox = await page.evaluate(() => {
    const b = document.querySelector('#legend-byline').getBoundingClientRect();
    const l = document.querySelector('.stage__legend').getBoundingClientRect();
    return { bylineBottom: Math.round(b.bottom), legendTop: Math.round(l.top), overlap: Math.round(b.bottom - l.top) };
  });
  log('OVERLAP ' + JSON.stringify(bylineBox));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // --- caveat rotation across projection / definition / layer ---
  const seen = [];
  const snap = async (tag) => {
    await page.evaluate(() => { document.querySelector('.byline__crit').click(); });
    await page.waitForTimeout(250);
    const c = await crit();
    seen.push([tag, (c && c.items) || []]);
    await page.evaluate(() => { document.querySelector('.byline__crit').click(); });
    await page.waitForTimeout(120);
  };
  await snap('default');
  await page.keyboard.press('p'); await page.waitForTimeout(900); await snap('proj2');
  await page.keyboard.press('3'); await page.waitForTimeout(500); await snap('def-controlled');
  await page.keyboard.press('4'); await page.waitForTimeout(500); await snap('def-influenced');
  await page.keyboard.press('1'); await page.waitForTimeout(500);
  log('CAVEATS ' + JSON.stringify(seen, null, 1));

  // --- definition switch keeps the legend in step ---
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k); await page.waitForTimeout(400);
    const t = await page.evaluate(() => ({
      head: ((document.querySelector('.legend__head') || document.querySelector('.legend--compact') || {}).innerText || '(compact)').replace(/\n+/g, ' | '),
      byline: [...document.querySelectorAll('#legend-byline [data-field]')].map(e=>e.dataset.field+'='+e.textContent).join(' ;; '),
      mapCard: (document.querySelector('.map__figs')||{}).innerText,
    }));
    log('DEF ' + k + ' :: ' + JSON.stringify(t, null, 1));
  }
  await page.keyboard.press('1'); await page.waitForTimeout(300);

  // --- legend row: name them ---
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.legend__entry[data-status]')];
    if (rows[1]) rows[1].scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(150);
  const rowInfo = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.legend__entry[data-status]')];
    if (!rows[1]) return { status: '(legend is compact at this width)' };
    rows[1].click();
    return { status: rows[1].dataset.status };
  });
  await page.waitForTimeout(900);
  await shot('roll-open');
  log('ROLL ' + JSON.stringify(await page.evaluate(() => {
    const box = document.querySelector('.legend__roll');
    return box ? { head: box.querySelector('.legend__roll-h').innerText, n: box.querySelectorAll('li').length, foot: box.querySelector('.legend__roll-foot').innerText, first: [...box.querySelectorAll('li')].slice(0,6).map(e=>e.innerText) } : null;
  })) + ' for ' + rowInfo.status);

  // --- layer change: is the byline honest about it? ---
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'mechanism'));
  await page.waitForTimeout(1400);
  await shot('layer-mechanism');
  log('LAYER mechanism byline: ' + await page.evaluate(() => {
    const e = document.querySelector('#legend-byline [data-field="colour"]');
    return e ? e.className + ' :: ' + e.textContent : 'none';
  }));
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'tenure'));
  await page.waitForTimeout(1400);
  log('LAYER tenure byline: ' + await page.evaluate(() => {
    const e = document.querySelector('#legend-byline [data-field="colour"]');
    return e ? e.className + ' :: ' + e.textContent : 'none';
  }));
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));
  await page.waitForTimeout(800);

  // --- fold with a real pointer ---
  let foldErr = null;
  try { await page.click('.legend__toggle', { timeout: 4000 }); }
  catch (e) { foldErr = String(e).slice(0, 200); }
  await page.waitForTimeout(300);
  await shot('folded');
  log('FOLD pointer: ' + (foldErr || 'clicked ok') + ' :: ' + await page.evaluate(() => document.querySelector('.stage__legend').innerText.slice(0,80)));

  log('ERRORS ' + JSON.stringify(errs));
};
