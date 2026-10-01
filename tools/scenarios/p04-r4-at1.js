/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* AT1: at 1280x800, on every one of the 260 territories, the four answers and
   the franchise line clear the panel's bottom edge with no scrolling. */
module.exports = async ({ page, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const res = await page.evaluate(async () => {
    const { store, data } = window.BEA;
    const wait = (n = 3) => new Promise(r => { let i = n; const t = () => (--i <= 0 ? r() : requestAnimationFrame(t)); requestAnimationFrame(t); });
    const bad = [];
    let n = 0, franchise = 0, thesis = 0, granted = 0;
    for (const t of data.territories) {
      const y = t.acquiredYear || t.firstYear || 1900;
      store.dispatch('setYear', y); store.dispatch('select', t.id); store.flush();
      await wait(4);
      const host = document.querySelector('.app__dossier');
      const root = document.querySelector('.dossier');
      const fold = root && root.querySelector('.dsr__fold');
      if (!host || !fold) continue;
      n++;
      const over = Math.round(fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom);
      const txt = fold.innerText;
      const has = s => txt.includes(s);
      const four = /LEGAL STATUS|Britain held nothing/i.test(txt)
        && /HOW IT WAS TAKEN|No acquisition is recorded/i.test(txt)
        && /HOW IT ENDED|No departure is recorded/i.test(txt);
      if (/WHO COULD VOTE/i.test(txt)) franchise++;
      if (root.querySelector('.dsr__thesisline:not([hidden])')) thesis++;
      const full = root.innerText;
      if (/granted\s+(independence|self-government|responsible government|dominion)/i.test(full)) granted++;
      if (over > 0 || !four) bad.push({ id: t.id, y, over, four });
      void has;
    }
    return { n, bad, franchise, thesis, granted };
  });
  log('territories measured: ' + res.n);
  log('AT1 failures (fold overflows or a missing answer): ' + res.bad.length);
  log(JSON.stringify(res.bad.slice(0, 25), null, 1));
  log('franchise line present: ' + res.franchise + '/' + res.n);
  log('thesis line visible above the fold: ' + res.thesis + '/' + res.n);
  log('"granted" used as a mechanism: ' + res.granted);
  log('ERRORS ' + JSON.stringify(errs.slice(0, 8)));
};
