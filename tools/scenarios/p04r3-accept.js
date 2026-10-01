/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 3 — the acceptance tests, run against the running app. */
const BANNED = ['acquired', 'pacified', 'unrest', 'mixed legacy', 'rich tapestry', 'played a key role',
  'left a lasting legacy', 'both sides', 'arguably', 'many would say', 'it is important to note',
  'the natives revolted', 'civilising mission'];

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(2200);

  /* ---- T4: Egypt, four legal labels ------------------------------------ */
  const egypt = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await page.evaluate((yy) => window.BEA.store.batch((d) => { d('setYear', yy); d('select', 'egypt'); }), y);
    await page.waitForTimeout(260);
    egypt.push(await page.evaluate(() => {
      const a = document.querySelector('.dossier');
      return {
        y: window.BEA.store.getState().year,
        word: (a.querySelector('.dsr__statusword') || {}).textContent,
        label: (a.querySelector('.dsr__statuslabel') || {}).textContent,
        ended: (a.querySelector('[data-block="ended"]') || {}).innerText.replace(/\s+/g, ' ').slice(0, 190),
      };
    }));
  }
  log('EGYPT', JSON.stringify(egypt, null, 1));

  /* ---- T2: banned strings in the rendered panel ------------------------- */
  const ids = ['kenya', 'british-india', 'new-zealand', 'barbados', 'egypt', 'ireland', 'nigeria', 'jamaica', 'cape-colony', 'hong-kong'];
  const hits = [];
  let actorsMissing = 0, thinkBoxes = 0, quotes = 0;
  for (const id of ids) {
    await page.evaluate((i) => window.BEA.store.batch((d) => { d('setYear', 1913); d('select', i); }), id);
    await page.waitForTimeout(220);
    const r = await page.evaluate((banned) => {
      const a = document.querySelector('.dossier');
      if (!a) return null;
      const txt = a.innerText;
      const quoted = [...a.querySelectorAll('.src__quote, .dsr__belief, .dsr__style')].map((n) => n.innerText).join(' ');
      const found = [];
      for (const b of banned) {
        const re = new RegExp('\\b' + b.replace(/ /g, '\\s+') + '\\b', 'gi');
        const m = txt.match(re);
        if (!m) continue;
        const q = quoted.match(re);
        const n = m.length - (q ? q.length : 0);
        if (n > 0) found.push(b + ' x' + n);
      }
      return {
        found,
        think: !!a.querySelector('.dsr__think'),
        missingActors: !!a.querySelector('.dsr__missing'),
        because: [...a.querySelectorAll('.dsr-chip__rel')].map((n) => n.textContent).filter((t) => /because/i.test(t)).length,
        chipWords: [...new Set([...a.querySelectorAll('.dsr-chip__rel')].map((n) => n.textContent))],
        srcBoiler: (a.innerText.match(/A book of history is written to persuade/g) || []).length,
        srcBoiler2: (a.innerText.match(/It is built from other people/g) || []).length,
        srcAgain: a.querySelectorAll('.src--again').length,
        elkins: /Written to argue that the detention system in Kenya/.test(a.innerText),
      };
    }, BANNED);
    if (!r) continue;
    if (r.found.length) hits.push(id + ': ' + r.found.join(', '));
    if (r.missingActors) actorsMissing++;
    if (r.think) thinkBoxes++;
    log(id, JSON.stringify(r));
  }
  log('BANNED HITS', hits.length, JSON.stringify(hits));
  log('think boxes', thinkBoxes, 'of', ids.length, '| [missing local actors] shown on', actorsMissing);

  /* ---- T5: a chip navigates and Back returns exactly ---------------------- */
  await page.goto('http://localhost:8777/app/#year=1913&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const start = await page.evaluate(() => ({ hash: location.hash, view: window.BEA.store.getState().mapView }));
  const chip = await page.evaluate(() => {
    const c = document.querySelector('.dsr__because .dsr-chip');
    if (!c) return null;
    c.scrollIntoView({ block: 'center' });
    return c.innerText.replace(/\s+/g, ' ');
  });
  await page.waitForTimeout(250);
  await page.click('.dsr__because .dsr-chip');
  await page.waitForTimeout(900);
  const mid = await page.evaluate(() => ({ hash: location.hash, view: window.BEA.store.getState().mapView, crumb: (document.querySelector('.dsr__back') || {}).innerText }));
  await page.click('.dsr__back');
  await page.waitForTimeout(900);
  const back = await page.evaluate(() => ({ hash: location.hash, view: window.BEA.store.getState().mapView, crumb: !!document.querySelector('.dsr__back') }));
  log('CHIP', chip, '\n start', JSON.stringify(start), '\n mid', JSON.stringify(mid), '\n back', JSON.stringify(back));

  /* ---- the 1980 title bug ------------------------------------------------ */
  await page.evaluate(() => window.BEA.store.batch((d) => { d('setYear', 1980); d('select', 'british-india'); }));
  await page.waitForTimeout(300);
  log('BRITISH INDIA AT 1980 title:', await page.evaluate(() => document.querySelector('.dsr__name').textContent + ' | ' + document.querySelector('.dsr__sub').innerText));

  /* ---- keyboard reach ----------------------------------------------------- */
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('d');
  await page.waitForTimeout(250);
  log('after D, focus is:', await page.evaluate(() => {
    const a = document.activeElement;
    return a.className + ' | inDossier=' + !!a.closest('.app__dossier');
  }));
  let tabs = 0;
  for (; tabs < 12; tabs++) {
    const inD = await page.evaluate(() => !!(document.activeElement && document.activeElement.closest('.app__dossier')));
    if (!inD) break;
    await page.keyboard.press('Tab');
  }
  log('tabs available inside the dossier before leaving it:', tabs);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  log('after Escape:', await page.evaluate(() => location.hash + ' focus=' + (document.activeElement && document.activeElement.id)));

  log('PAGE ERRORS', errs.length, JSON.stringify(errs.slice(0, 6)));
};
