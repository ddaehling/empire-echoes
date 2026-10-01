/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-open — open the teaching desk and look at each surface. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  const entry = await page.$('.tp-entry');
  log('entry present: ' + !!entry);
  if (!entry) { await shot('no-entry'); return; }

  await entry.click();
  await page.waitForTimeout(900);
  await shot('workshop');

  const m = await page.evaluate(() => {
    const d = document.querySelector('.tp');
    const r = d && d.getBoundingClientRect();
    return {
      desk: r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none',
      hash: location.hash,
      tabs: [...document.querySelectorAll('.tp-tab')].map(t => t.textContent.trim().slice(0, 20)),
      moves: [...document.querySelectorAll('.tp-move__name')].map(t => t.textContent),
      sources: document.querySelectorAll('.tp-source').length,
      textareas: document.querySelectorAll('.tp-write').length,
      docScroll: document.documentElement.scrollHeight - innerHeight,
    };
  });
  log('DESK ' + JSON.stringify(m));

  for (const id of ['evidence', 'classroom', 'methods']) {
    await page.click('#tp-tab-' + id);
    await page.waitForTimeout(700);
    await shot(id);
    const s = await page.evaluate((k) => {
      const p = document.getElementById('tp-page-' + k);
      return { hash: location.hash, rows: document.querySelectorAll('.tp-led__rec').length,
        h: p ? Math.round(p.getBoundingClientRect().height) : 0,
        words: (p ? p.innerText : '').trim().split(/\s+/).filter(Boolean).length };
    }, id);
    log(id + ' ' + JSON.stringify(s));
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({ desk: !!document.querySelector('.tp'), hash: location.hash,
    map: (() => { const c = document.querySelector('.stage__map canvas'); const r = c && c.getBoundingClientRect(); return r ? Math.round(r.width) + 'x' + Math.round(r.height) : 'none'; })() }));
  log('AFTER ESC ' + JSON.stringify(after));
  await shot('closed');
};
