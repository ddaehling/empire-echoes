/* GUARANTEE THIS FILE PROTECTS: the dossier answers the four questions above
 * the fold, every destination in its sheet carries its evidence, and no banned
 * euphemism reaches a student.
 *
 * WAVE 9: the three `page.click('[data-act="sheet"][data-sheet="…"]')` calls
 * below were unscoped. The selector now resolves to TWO elements — the
 * dossier's and the Close's — and Playwright takes the first, which is behind
 * `.cl-close__sheetnote` and cannot be pressed, so the scenario died on a
 * 30-second timeout at test 3 and tests 4, 5 and 6 never ran. Every press is
 * scoped to `#dossier`, which is the surface these rules are about.
 */
/* P04 round 6 — FEATURE_SPEC §2 P04 acceptance tests 1..6, against the staged
 * dossier. Ten of the twelve sections are now destinations in the shell's
 * sheet, so the audits that used to read one scroll open every destination and
 * read all of them. Nothing is exempt from an audit by having moved. */
const BANNED = [
  /\bacquired\b/i, /\bpacified\b/i, /\bnatives?\b/i, /\btribal\b/i, /\btribes?\b/i,
  /\bunrest\b/i, /\brich tapestry\b/i, /\bplayed a key role\b/i, /\bleft a lasting legacy\b/i,
  /\bboth sides\b/i, /\bit is important to note\b/i, /\barguably\b/i, /\bmany would say\b/i,
  /\bmixed legacy\b/i, /\bgranted independence\b/i, /\bcivilising mission\b/i,
];

module.exports = async ({ page, shot, log: rawLog }) => {
  const LOG = [];
  const log = (...a) => { LOG.push(a.join(' ')); rawLog(...a); };
  /* ROUND 2, WAVE 9: A FLAT 2,200ms WAS THE WHOLE OF TEST 1'S FAILURE.
     `TEST1 bengal-presidency: status null taken null ended null` and
     `TEST1 kenya: status 2105 taken 4027 ended 4983` were reported as real
     defects of the dossier's fold. They are not. Measured with the app's own
     readiness state instead of a sleep, at the same 1280x800: bengal-presidency
     puts the four answers at 337 / 504 / 583 and kenya at 244 / 410 / 494,
     against a panel bottom of 800. The sleep was reading a half-painted panel —
     sometimes the entry had not mounted at all (null), sometimes it was still
     the previous entry's taller layout (2105). A harness that reports a
     half-painted frame as a layout defect is the failure mode this whole wave
     is about, in the check rather than in the app. */
  const open = async (sel, yr) => {
    await page.goto('http://localhost:8777/app/#year=' + yr + '&sel=' + sel, { waitUntil: 'load' });
    await page.waitForFunction(
      () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready',
      null, { timeout: 30000 });
    await page.waitForFunction((k) => {
      const n = document.querySelector('.app__dossier');
      return !!n && !!n.querySelector('.dsr__name') && (n.dataset.for || k) === k;
    }, sel, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(900);
  };
  /* AND THE SHEET IS SHUT BEFORE ANYTHING IS PRESSED IN THE DOSSIER.
     `wholeEntry()` below opens every destination and presses Escape after each;
     when the last one does not take, the dossier is left INERT under an open
     sheet (which is `read.js` R15 working correctly) and the next press in it
     cannot land. That came out as a 30-second Playwright timeout that killed
     the scenario at TEST3, so TEST4, 5 and 6 had not run for some time. */
  const shutSheet = async () => {
    await page.evaluate(() => {
      const a = document.getElementById('app');
      if (a && a.dataset.sheet === 'open') {
        const b = document.querySelector('.cx-sheet__close');
        if (b) b.click();
      }
    });
    await page.waitForFunction(() => {
      const a = document.getElementById('app');
      return !a || a.dataset.sheet !== 'open';
    }, null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);
  };

  /* Every word of this entry, wherever it is standing. */
  const wholeEntry = async () => {
    const ids = await page.$$eval('.dsr__idxbtn', (ns) => ns.map((n) => n.dataset.sheet));
    let txt = await page.evaluate(() => {
      const c = document.querySelector('.app__dossier').cloneNode(true);
      for (const q of c.querySelectorAll('blockquote, .src__speaker, .dsr__belief')) q.remove();
      return c.innerText;
    });
    for (const id of ids) {
      await page.evaluate((k) => {
        document.querySelector('.dsr__idxbtn[data-sheet="' + k + '"]').click();
      }, id);
      await page.waitForTimeout(200);
      txt += '\n' + await page.evaluate(() => {
        const b = document.querySelector('.cx-sheet__body');
        if (!b) return '';
        const c = b.cloneNode(true);
        for (const q of c.querySelectorAll('blockquote, .src__speaker, .dsr__belief')) q.remove();
        return c.innerText;
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);
    }
    return { txt, ids };
  };

  /* ---- TEST 1: the four answers, no scroll, at 1280x800 ---- */
  await page.setViewportSize({ width: 1280, height: 800 });
  const t1 = [];
  for (const [id, yr] of [['bengal-presidency', 1765], ['kenya', 1964], ['british-india', 1900],
    ['egypt', 1922], ['new-zealand', 1900], ['northern-rhodesia', 1900], ['jamaica', 1838]]) {
    await open(id, yr);
    t1.push(await page.evaluate((k) => {
      const a = document.querySelector('.app__dossier');
      const r = a.getBoundingClientRect();
      const box = (s) => { const n = document.querySelector(s); if (!n) return null; const b = n.getBoundingClientRect(); return Math.round(b.bottom); };
      const fr = [...document.querySelectorAll('.dsr__fold .dsr__fact, .dsr__fold p')].find((x) => /who could vote/i.test(x.textContent));
      return {
        id: k, scrolled: a.scrollTop,
        name: !!document.querySelector('.dsr__name'),
        status: box('#dsr-status'), taken: box('#dsr-taken'), ended: box('#dsr-ended'),
        thesis: !!document.querySelector('.dsr__thesisline:not([hidden])'),
        franchise: fr ? fr.innerText.replace(/\s+/g, ' ').slice(0, 70) : null,
        bottom: Math.round(r.bottom),
      };
    }, id));
  }
  for (const r of t1) {
    const ok = r.name && r.status && r.taken && r.ended
      && r.status <= r.bottom && r.taken <= r.bottom && r.ended <= r.bottom && !!r.franchise;
    log('TEST1 ' + r.id + ': status ' + r.status + ' taken ' + r.taken + ' ended ' + r.ended
      + ' / panel bottom ' + r.bottom + ' · argument-line=' + r.thesis
      + ' · franchise="' + r.franchise + '" -> ' + (ok ? 'PASS' : 'FAIL'));
  }
  await shot('t1-1280');
  await page.setViewportSize({ width: 1366, height: 768 });

  /* ---- TEST 2: banned strings, across the WHOLE entry ---- */
  const sample = ['bengal-presidency', 'kenya', 'british-india', 'new-zealand', 'jamaica', 'ireland',
    'nigeria', 'union-of-south-africa', 'canada', 'hong-kong', 'egypt', 'mandatory-palestine',
    'bermuda', 'ascension', 'gold-coast', 'punjab-province', 'barbados', 'new-south-wales',
    'sierra-leone', 'malta', 'cyprus', 'aden-colony', 'singapore', 'ceylon', 'quebec'];
  const hits = [];
  let audited = 0;
  for (const id of sample) {
    await open(id, 1900);
    const { txt, ids } = await wholeEntry();
    audited += ids.length;
    const clean = txt
      .replace(/(\w)'(\w)/g, '$1’$2')
      .replace(/[“][^”]*[”]/g, ' ')
      .replace(/[‘][^’]*[’]/g, ' ')
      .replace(/'[^']{1,120}'/g, ' ');
    for (const re of BANNED) {
      const m = clean.match(re);
      if (m) hits.push(id + ' :: ' + m[0] + ' :: …' + clean.slice(Math.max(0, clean.search(re) - 60), clean.search(re) + 60).replace(/\s+/g, ' ') + '…');
    }
  }
  log('TEST2 banned strings over ' + sample.length + ' entries and ' + audited + ' opened sheets: '
    + hits.length + ' -> ' + (hits.length ? 'FAIL' : 'PASS'));
  hits.slice(0, 20).forEach((h) => log('   ' + h));

  /* ---- TEST 3: named non-British parties, and the defect on the page ---- */
  /* ROUND 2, WAVE 9: THIS ASSERTED A HOLE RATHER THAN THE RULE ABOUT HOLES.
     It required `.dsr__missing .defect` on Bermuda at 1700, because Bermuda was
     once "the only entry of N" that named no non-British party. The dossier's
     own sentence says exactly that, so the day the data agent names somebody
     there the marker correctly disappears and this check reports a defect for a
     record that got better. The RULE is what matters and it has not changed: a
     hole in the record is PRINTED, never hidden. So: either the entry names
     somebody, or it says in `--danger` that it does not. Both are honest; only
     silence is not. And it is read across the whole entry, sheets included,
     because the actors moved into a destination. */
  await open('bermuda', 1700);
  const bm = await page.evaluate(async () => {
    const seen = { defect: null, names: 0, promo: '' };
    const pr = document.querySelector('[data-block="actors-promo"] .dsr__promoline');
    seen.promo = pr ? pr.innerText.replace(/\s+/g, ' ').slice(0, 90) : '';
    const d0 = document.querySelector('.app__dossier .dsr__missing .defect, .app__dossier .dsr__nobody');
    if (d0) seen.defect = { where: 'page', colour: getComputedStyle(d0).color,
      text: (d0.parentElement || d0).innerText.slice(0, 70) };
    const btn = document.querySelector('.dsr__idxbtn[data-sheet="actors"]');
    if (btn) {
      btn.click();
      await new Promise((r) => setTimeout(r, 500));
      seen.names = document.querySelectorAll('.cx-sheet__body .dsr__actor-name').length;
      const d1 = document.querySelector('.cx-sheet__body .dsr__missing .defect, .cx-sheet__body .dsr__nobody');
      if (!seen.defect && d1) seen.defect = { where: 'sheet', colour: getComputedStyle(d1).color,
        text: (d1.parentElement || d1).innerText.slice(0, 70) };
    }
    return seen;
  });
  await shutSheet();
  bm.honest = bm.names > 0 || !!bm.promo || !!bm.defect;
  await open('kenya', 1920);
  const ke = await page.evaluate(() => {
    const p = document.querySelector('[data-block="actors-promo"] .dsr__promoline');
    return { named: p ? p.innerText.slice(0, 90) : null, route: !!document.querySelector('[data-sheet="actors"]') };
  });
  await shutSheet();
  await page.click('#dossier [data-act="sheet"][data-sheet="actors"]');
  await page.waitForTimeout(400);
  const keSheet = await page.evaluate(() => ({
    derived: !!document.querySelector('.cx-sheet__body .dsr__derived'),
    names: document.querySelectorAll('.cx-sheet__body .dsr__actor-name').length,
  }));
  log('TEST3 bermuda: ' + JSON.stringify(bm));
  log('TEST3 kenya names on page: ' + JSON.stringify(ke) + ' · sheet: ' + JSON.stringify(keSheet)
    + ' -> ' + (bm.honest && ke.named && keSheet.derived && keSheet.names ? 'PASS' : 'FAIL'));

  /* ---- TEST 4: Egypt's four legal labels ---- */
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await open('egypt', y);
    labels.push(await page.evaluate(() => {
      const f = document.querySelector('.dsr__statusline');
      return f ? f.innerText.replace(/\s+/g, ' ').trim() : null;
    }));
  }
  log('TEST4 Egypt: ' + JSON.stringify(labels));
  log('TEST4 distinct: ' + new Set(labels).size + '/4 -> ' + (new Set(labels).size === 4 ? 'PASS' : 'FAIL'));

  /* ---- TEST 5: because-chip navigation and Back ---- */
  await open('bengal-presidency', 1765);
  const nav = await page.evaluate(async () => {
    const chip = [...document.querySelectorAll('.dsr-chip[data-authored="yes"]')][0]
      || [...document.querySelectorAll('.dsr-chip')][0];
    if (!chip) return { ok: false, why: 'no chip on the page' };
    const before = { hash: location.hash, name: document.querySelector('.dsr__name').textContent };
    chip.click();
    await new Promise((r) => setTimeout(r, 900));
    const after = { hash: location.hash, name: document.querySelector('.dsr__name').textContent, back: !!document.querySelector('.dsr__back') };
    document.querySelector('.dsr__back').click();
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, before, after, home: { hash: location.hash, name: document.querySelector('.dsr__name').textContent } };
  });
  log('TEST5 chip: ' + JSON.stringify(nav));
  log('TEST5 -> ' + (nav.ok && nav.after.name !== nav.before.name && nav.home.name === nav.before.name ? 'PASS' : 'FAIL'));

  /* a chip inside a sheet navigates too, and takes the sheet down with it */
  await open('british-india', 1900);
  await shutSheet();
  await page.click('#dossier [data-act="sheet"][data-sheet="why"]');
  await page.waitForTimeout(400);
  const inSheet = await page.$('.cx-sheet__body .dsr-chip');
  if (inSheet) {
    const nm0 = await page.$eval('.dsr__name', (n) => n.textContent);
    await inSheet.click();
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => ({ name: document.querySelector('.dsr__name').textContent, sheet: document.querySelector('.app').dataset.sheet }));
    log('TEST5b chip inside the sheet: ' + nm0 + ' -> ' + st.name + ' · sheet now ' + st.sheet
      + ' -> ' + (st.name !== nm0 && st.sheet !== 'open' ? 'PASS' : 'FAIL'));
  } else log('TEST5b: no chip in the argument sheet');

  /* ---- TEST 6: retrieval conversion on return ----
     A hash-only navigation does not reload the module, so the session ledger
     carries every entry the audits above walked through. A first visit has to
     be a first visit: reload. */
  await open('bengal-presidency', 1765);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(
    () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready',
    null, { timeout: 30000 });
  await page.waitForFunction(() => !!document.querySelector('.app__dossier .dsr__name'),
    null, { timeout: 20000 }).catch(() => {});
  const first = await page.evaluate(() => !!document.querySelector('.dsr__retrieval'));
  /* THE STAMP IS A DWELL TIMER, NOT A PAINT. A flat 2,600ms sometimes beat it
     and the run then reported `ledger=0` — a check about what a returning
     student is shown, failing because the first visit had not yet counted. Wait
     for the record itself. */
  await page.waitForFunction(() => window.BEA.dossierLedger && window.BEA.dossierLedger.size() > 0,
    null, { timeout: 20000 }).catch(() => {});
  const stamped = await page.evaluate(() => window.BEA.dossierLedger.size());
  await page.evaluate(() => { document.querySelector('.dsr__close').click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForFunction(() => !!document.querySelector('.app__dossier .dsr__name'),
    null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1600);
  const second = await page.evaluate(() => {
    const r = document.querySelector('.dsr__retrieval');
    return { present: !!r, text: r ? r.innerText.slice(0, 90) : null, ledger: window.BEA.dossierLedger.size() };
  });
  log('TEST6 first=' + first + ' ledger=' + stamped + ' second=' + JSON.stringify(second)
    + ' -> ' + (!first && stamped > 0 && second.present ? 'PASS' : 'FAIL'));

  /* a claim inside a sheet is found only once the sheet has been opened */
  await open('british-india', 1900);
  const before6 = await page.evaluate(() => window.BEA.dossierLedger.all().filter((c) => /:evidence/.test(c)).length);
  await shutSheet();
  await page.click('#dossier [data-act="sheet"][data-sheet="evidence"]');
  await page.waitForTimeout(2400);
  const after6 = await page.evaluate(() => window.BEA.dossierLedger.all().filter((c) => /:evidence/.test(c)).length);
  log('TEST6b evidence claim found: before ' + before6 + ' after opening the sheet ' + after6
    + ' -> ' + (before6 === 0 && after6 > 0 ? 'PASS' : 'FAIL'));

  const pub = await page.evaluate(() => ({
    renderSource: typeof (window.BEA || {}).renderSource,
    unsourced: window.BEA.unsourcedCount(), classOnly: window.BEA.classOnlyCount(),
  }));
  log('renderSource published: ' + JSON.stringify(pub));

  /* AND IT EXITS NON-ZERO WHEN IT FAILS. This file writes its verdicts into its
     own log lines as `-> PASS` / `-> FAIL`; wave 9 makes the process agree with
     them, because until now it printed FAIL and returned 0. */
  const bad = LOG.filter((l) => /->\s*FAIL\b/.test(l));
  if (bad.length) throw new Error('P04 ROUND 6 HAS FAILURES\n' + bad.join('\n'));
};
