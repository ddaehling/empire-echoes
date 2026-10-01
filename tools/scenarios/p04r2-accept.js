/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 round 2 acceptance suite. Every FEATURE_SPEC §2 P04 test, run for real. */
const BANNED = [
  ['acquired', /\bacquired\b/gi], ['pacified', /\bpacified\b/gi], ['unrest', /\bunrest\b/gi],
  ['both sides', /\bboth sides\b/gi], ['mixed legacy', /\bmixed legacy\b/gi],
  ['rich tapestry', /\brich tapestry\b/gi], ['played a key role', /\bplayed a key role\b/gi],
  ['left a lasting legacy', /\bleft a lasting legacy\b/gi], ['arguably', /\barguably\b/gi],
  ['many would say', /\bmany would say\b/gi], ['it is important to note', /it is important to note/gi],
];

module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  const go = async (hash) => {
    await page.evaluate((h) => { location.hash = h; }, hash);
    await page.waitForTimeout(700);
  };
  const readDossier = () => page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    const q = (s) => { const n = d.querySelector(s); return n ? n.getBoundingClientRect().bottom : null; };
    const txt = (s) => { const n = d.querySelector(s); return n ? n.textContent.trim().replace(/\s+/g, ' ') : null; };
    return {
      panelBottom: d.getBoundingClientRect().bottom,
      endedBottom: q('[data-block="ended"]'),
      name: txt('.dsr__name'),
      status: txt('[data-block="status"] .dsr__statusline'),
      takenLead: txt('[data-block="taken"] .dsr__lead'),
      takenFrom: txt('[data-block="taken"] .dsr__from'),
      step: txt('[data-block="taken"] .dsr__step'),
      ended: txt('[data-block="ended"] .dsr__lead'),
      franchise: txt('.dsr__fold .dsr__franchise'),
      missing: !!d.querySelector('.dsr__missing'),
      missingText: txt('.dsr__missing'),
      nobody: txt('.dsr__nobody'),
      statusRun: txt('[data-block="status-full"] .dsr__from'),
      coverage: txt('[data-block="status-full"] .dsr__coverage'),
      all: d.textContent.replace(/\s+/g, ' '),
    };
  });

  /* --- TEST 1: four answers above the fold, franchise present ------------- */
  log('== TEST 1: above the fold at 1280x800');
  for (const id of ['bengal-presidency', 'british-india', 'kenya', 'jamaica', 'new-zealand', 'hong-kong', 'egypt', 'ascension', 'jersey', 'sokoto-caliphate']) {
    await go('#year=1913&sel=' + id);
    const r = await readDossier();
    log(`  ${id}: endedBottom=${r.endedBottom && Math.round(r.endedBottom)} panelBottom=${Math.round(r.panelBottom)} fits=${r.endedBottom != null && r.endedBottom <= r.panelBottom + 1} franchise=${r.franchise ? 'yes' : 'NO'}`);
  }

  /* --- the round-1 factual errors ---------------------------------------- */
  log('== ROUND-1 ERRORS');
  await go('#year=1930&sel=british-india');
  let r = await readDossier();
  log('  british-india@1930 status: ' + r.status);
  log('  british-india@1930 taken: ' + r.takenLead + ' || from: ' + r.takenFrom);
  log('  british-india@1930 step: ' + r.step);
  await shot('india-1930');
  await go('#year=1955&sel=kenya');
  r = await readDossier();
  log('  kenya@1955 taken: ' + r.takenLead + ' || from: ' + r.takenFrom);
  log('  kenya@1955 step: ' + r.step);
  await go('#year=1913&sel=bengal-presidency');
  r = await readDossier();
  log('  bengal@1913 status: ' + r.status);
  log('  bengal@1913 statusRun: ' + r.statusRun);
  log('  bengal@1913 coverage: ' + r.coverage);
  await go('#year=1955&sel=kenya');
  r = await readDossier();
  log('  kenya@1955 statusRun: ' + r.statusRun + ' || coverage: ' + r.coverage);
  await go('#year=1770&sel=bengal-presidency');
  r = await readDossier();
  log('  bengal@1770 status block: ' + (r.status || '').slice(0, 120));

  /* --- TEST 4: Egypt, four legal labels ---------------------------------- */
  log('== TEST 4: Egypt 1882/1914/1922/1956');
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await go('#year=' + y + '&sel=egypt');
    const rr = await readDossier();
    labels.push(rr.status);
    log('  ' + y + ': ' + rr.status);
  }
  log('  DISTINCT: ' + new Set(labels).size + ' of 4');

  /* --- TEST 3 + banned strings across every territory --------------------- */
  log('== TEST 2 + 3: sweep every territory');
  const ids = await page.evaluate(() => (window.BEA && window.BEA.data ? window.BEA.data.territories.map(t => t.id) : []));
  log('  territories seen by the page: ' + ids.length);
  const sweep = { missing: [], nobody: [], banned: {}, noActors: [], unsourced: 0 };
  const sample = ids.length ? ids : [];
  for (const id of sample) {
    await page.evaluate((i) => { location.hash = '#year=1913&sel=' + i; }, id);
    await page.waitForTimeout(45);
    const t = await page.evaluate(() => {
      const d = document.querySelector('.app__dossier');
      const m = d.querySelector('.dsr__missing');
      return { txt: d.textContent.replace(/\s+/g, ' '), missing: m ? m.textContent.trim().replace(/\s+/g,' ').slice(0, 60) : null,
        nobody: !!d.querySelector('.dsr__nobody') };
    });
    if (t.missing) sweep.missing.push(id + ' :: ' + t.missing);
    if (t.nobody) sweep.nobody.push(id);
    for (const [name, re] of BANNED) {
      const hits = t.txt.match(re);
      if (hits) (sweep.banned[name] = sweep.banned[name] || []).push(id + ' x' + hits.length);
    }
  }
  log('  [missing local actors] / [no one from this place]: ' + sweep.missing.length);
  sweep.missing.slice(0, 20).forEach(x => log('    ' + x));
  log('  uninhabited-at-taking handled honestly: ' + sweep.nobody.length + ' (' + sweep.nobody.slice(0, 14).join(', ') + ')');
  for (const k of Object.keys(sweep.banned)) log('  BANNED "' + k + '": ' + sweep.banned[k].length + ' territories → ' + sweep.banned[k].slice(0, 8).join(', '));
  if (!Object.keys(sweep.banned).length) log('  BANNED STRINGS: none');
};
