/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.waitForTimeout(2200);

  const set = async (h) => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(700); };
  const D = () => page.$('.app__dossier, [data-slot="dossier"], #dossier');

  // ---- AT1: above the fold at 1280x800
  await page.setViewportSize({ width: 1280, height: 800 });
  await set('#year=1913&sel=bengal-presidency');
  await page.waitForTimeout(900);
  const fold = await page.evaluate(() => {
    const host = document.querySelector('.app__dossier') || document.querySelector('[data-slot=dossier]');
    if (!host) return { err: 'no host' };
    const r = host.getBoundingClientRect();
    const need = ['.dsr__name, .dsr__title, h1, h2', '.dsr__statusword', '[data-block=taken]', '[data-block=ended]'];
    const res = {};
    for (const sel of need) {
      const n = host.querySelector(sel);
      res[sel] = n ? { top: Math.round(n.getBoundingClientRect().top), bottom: Math.round(n.getBoundingClientRect().bottom) } : null;
    }
    const franchise = host.querySelector('.dsr__franchise');
    return { hostTop: Math.round(r.top), hostBottom: Math.round(r.bottom), scrollTop: host.scrollTop, scrollH: host.scrollHeight, clientH: host.clientHeight, res,
      franchiseTop: franchise ? Math.round(franchise.getBoundingClientRect().top) : null,
      foldEl: !!host.querySelector('.dsr__fold'),
      foldBottom: host.querySelector('.dsr__fold') ? Math.round(host.querySelector('.dsr__fold').getBoundingClientRect().bottom) : null };
  });
  log('AT1 fold geometry @1280x800: ' + JSON.stringify(fold, null, 1));
  await shot('at1-1280x800-bengal');

  // ---- AT4: Egypt across four years
  for (const y of [1882, 1914, 1922, 1956]) {
    await set('#year=' + y + '&sel=egypt');
    await page.waitForTimeout(600);
    const t = await page.evaluate(() => {
      const host = document.querySelector('.app__dossier');
      const w = host && host.querySelector('.dsr__statusword');
      const lab = host && host.querySelector('.dsr__statuslabel, .dsr__spanlabel');
      const sh = host && host.querySelector('.dsr__short');
      return { word: w && w.textContent, label: lab && lab.textContent, short: sh && sh.textContent,
        head: host ? host.innerText.slice(0, 620) : 'NO HOST' };
    });
    log('AT4 EGYPT ' + y + ': ' + JSON.stringify(t, null, 1));
    await shot('at4-egypt-' + y);
  }
  log('ERRORS: ' + JSON.stringify(errs));
};
