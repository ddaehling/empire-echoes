/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Teacher surfaces — print emulation. Opens the Teaching desk, fires each
   printable pack via its own button, and reads the .tp-paper the app builds. */
module.exports = async ({ page, log, shot }) => {
  await page.addInitScript(() => { window.print = () => {}; });
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 40000 });
  await page.waitForTimeout(3000);

  log('STEPINDEX ' + JSON.stringify(await page.evaluate(() => {
    const t = window.BEA && window.BEA.tourStepIndex;
    if (!t) return null;
    return { verified: t.verified, route: t.route, routes: Object.fromEntries(Object.entries(t.routes).map(([k, v]) => [k, { verified: v.verified, required: v.required }])) };
  })));

  const board = await page.evaluate(() => {
    const ol = document.querySelector('.tp-board__sched');
    if (!ol) return null;
    return [...ol.querySelectorAll('li')].map(li => ({
      when: (li.querySelector('.tp-board__st') || {}).textContent,
      lead: (li.querySelector('.tp-board__sl') || {}).textContent,
      note: (li.querySelector('.tp-board__sn') || {}).textContent,
    }));
  });
  log('DESK BOARD ' + JSON.stringify(board, null, 1));

  const lessonRows = await page.evaluate(() => [...document.querySelectorAll('.tp-lesson__b')].map(li => ({
    at: (li.querySelector('.tp-lesson__at') || {}).textContent,
    t: (li.querySelector('.tp-lesson__t') || {}).textContent,
    do: (li.querySelector('.tp-lesson__do') || {}).textContent,
    ask: (li.querySelector('.tp-lesson__ask') || {}).textContent,
  })));
  log('DESK LESSON');
  lessonRows.forEach((r, i) => log('  [' + (i + 1) + '] ' + r.at + ' | ' + r.t + '\n      DO ' + r.do + '\n      ' + r.ask));

  const want = process.env.TSURF_PACKS ? process.env.TSURF_PACKS.split(',') : ['board', 'plan', 'key'];
  for (const id of want) {
    const ok = await page.evaluate((pid) => {
      const old = document.querySelector('.tp-paper'); if (old) old.remove();
      const li = document.querySelector('[data-pack="' + pid + '"] button, .tp-acts button');
      return false;
    }, id);
  }
  log('--- packs ---');
  for (const id of want) {
    await page.evaluate(() => { const o = document.querySelector('.tp-paper'); if (o) o.remove(); });
    const clicked = await page.evaluate((pid) => {
      const host = document.querySelector('[data-pack="' + pid + '"]');
      let btn = host ? host.querySelector('button') : null;
      if (!btn) {
        btn = [...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || '').toLowerCase().includes(pid));
      }
      if (!btn) return false;
      btn.click(); return true;
    }, id);
    if (!clicked) { log('PACK ' + id + ' — no button found'); continue; }
    await page.waitForTimeout(700);
    const info = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      if (!p) return null;
      return { title: (p.querySelector('.tp-paper__pack') || {}).textContent, text: (p.querySelector('.tp-paper__body') || p).innerText };
    });
    if (!info) { log('PACK ' + id + ' — nothing built'); continue; }
    log('===== PACK ' + id + ' :: ' + info.title + ' =====');
    log(info.text);
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const p = document.querySelector('.tp-paper');
      const r = p.getBoundingClientRect();
      const mmPerPx = 25.4 / 96;
      return { h: Math.round(r.height), pagesA4: (r.height * mmPerPx / 297).toFixed(2) };
    });
    log('PACK ' + id + ' height=' + m.h + 'px  A4 pages≈' + m.pagesA4);
    await shot('pack-' + id, '.tp-paper');
    await page.emulateMedia({ media: 'screen' });
  }
};
