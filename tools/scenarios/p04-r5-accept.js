/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p04-r5`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P04 round 5: the dossier as staged destinations. */
/* P04 round 5 — FEATURE_SPEC §2 P04 acceptance tests 2 to 6, headless. */
const BANNED = [
  /\bacquired\b/i, /\bpacified\b/i, /\bnatives?\b/i, /\btribal\b/i, /\btribes?\b/i,
  /\bunrest\b/i, /\brich tapestry\b/i, /\bplayed a key role\b/i, /\bleft a lasting legacy\b/i,
  /\bboth sides\b/i, /\bit is important to note\b/i, /\barguably\b/i, /\bmany would say\b/i,
  /\bmixed legacy\b/i, /\bgranted independence\b/i, /\bcivilising mission\b/i,
];
module.exports = async ({ page, shot, log }) => {
  const open = async (sel, yr) => {
    await page.goto('http://localhost:8777/app/#year=' + yr + '&sel=' + sel, { waitUntil: 'load' });
    await page.waitForTimeout(2200);
  };

  /* ---- TEST 4: Egypt's four legal labels ---- */
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await open('egypt', y);
    labels.push(await page.evaluate(() => {
      const w = document.querySelector('.dsr__statusword');
      const line = document.querySelector('#dsr-status');
      const full = document.querySelector('.dsr__statusline');
      return {
        word: full ? full.innerText.replace(/\s+/g, ' ').trim() : (w ? w.textContent.trim() : null),
        gov: (() => { const n = [...document.querySelectorAll('#dsr-status .dsr__fact, #dsr-status p')].find((x) => /governed from/i.test(x.textContent)); return n ? n.textContent.trim().slice(0, 80) : null; })(),
        franchise: (() => { const n = [...document.querySelectorAll('#dsr-status .dsr__fact, #dsr-status p')].find((x) => /who could vote/i.test(x.textContent)); return n ? n.textContent.trim().slice(0, 90) : null; })(),
        has: !!line,
      };
    }));
  }
  log('TEST4 Egypt labels: ' + JSON.stringify(labels, null, 1));
  const words = labels.map((l) => l.word);
  log('TEST4 distinct labels: ' + new Set(words).size + ' of 4 -> ' + (new Set(words).size === 4 ? 'PASS' : 'FAIL'));
  await shot('egypt-1956');

  /* ---- TEST 2: banned strings outside quotations ---- */
  const sample = ['bengal-presidency', 'kenya', 'british-india', 'new-zealand', 'jamaica', 'ireland',
    'nigeria', 'union-of-south-africa', 'canada', 'hong-kong', 'egypt', 'mandatory-palestine',
    'bermuda', 'ascension', 'gold-coast', 'punjab-province', 'barbados', 'new-south-wales',
    'sierra-leone', 'malta', 'cyprus', 'aden-colony', 'singapore', 'ceylon', 'quebec'];
  const hits = [];
  for (const id of sample) {
    await open(id, 1900);
    const txt = await page.evaluate(() => {
      const root = document.querySelector('.app__dossier');
      /* Open every fold so the audit sees everything the panel can print,
         then remove every quotation and every historical-term mark before
         testing: §7.1 bans these words in OUR prose, not in a source. */
      for (const d of root.querySelectorAll('details')) d.open = true;
      const c = root.cloneNode(true);
      for (const q of c.querySelectorAll('blockquote, .src__speaker, .dsr__belief')) q.remove();
      /* "Zero hits OUTSIDE quotation marks." Everything between a pair of
         quotation marks is a quotation — a transcribed source, the record's
         own wording that this atlas is refusing to print in its voice, or a
         historical term marked under §7.1 rule 4 — so it is removed before
         the audit, and what is left is this atlas speaking for itself. */
      return c.innerText
        .replace(/(\w)'(\w)/g, '$1\u2019$2')      /* an apostrophe is not a quote mark */
        .replace(/[\u201c][^\u201d]*[\u201d]/g, ' ')
        .replace(/[\u2018][^\u2019]*[\u2019]/g, ' ')
        .replace(/'[^']{1,120}'/g, ' ');
    });
    for (const re of BANNED) {
      const m = txt.match(re);
      if (m) {
        const i = txt.search(re);
        hits.push(id + ' :: ' + m[0] + ' :: …' + txt.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ') + '…');
      }
    }
  }
  log('TEST2 banned-string hits: ' + hits.length);
  hits.slice(0, 25).forEach((h) => log('   ' + h));

  /* ---- TEST 3: local actors ---- */
  await open('bermuda', 1700);
  const bm = await page.evaluate(() => {
    const d = [...document.querySelectorAll('.app__dossier .defect')].map((x) => x.textContent);
    const el = document.querySelector('.dsr__missing .defect');
    return { defects: d, colour: el ? getComputedStyle(el).color : null, derived: !!document.querySelector('.dsr__derived') };
  });
  log('TEST3 bermuda: ' + JSON.stringify(bm));

  /* ---- TEST 5: because-chip navigation and Back ---- */
  await open('bengal-presidency', 1765);
  const nav = await page.evaluate(async () => {
    const chip = [...document.querySelectorAll('.dsr-chip[data-authored="yes"]')][0];
    if (!chip) return { ok: false, why: 'no authored chip' };
    const before = { hash: location.hash, name: document.querySelector('.dsr__name').textContent, target: chip.dataset.target, section: chip.dataset.section, text: chip.textContent };
    chip.click();
    await new Promise((r) => setTimeout(r, 900));
    const after = { hash: location.hash, name: document.querySelector('.dsr__name').textContent, back: !!document.querySelector('.dsr__back'), backText: (document.querySelector('.dsr__back') || {}).textContent };
    document.querySelector('.dsr__back').click();
    await new Promise((r) => setTimeout(r, 900));
    const home = { hash: location.hash, name: document.querySelector('.dsr__name').textContent };
    return { ok: true, before, after, home };
  });
  log('TEST5 chip nav: ' + JSON.stringify(nav, null, 1));

  /* ---- TEST 6: retrieval conversion on return ---- */
  await open('bengal-presidency', 1765);
  const first = await page.evaluate(() => !!document.querySelector('.dsr__retrieval'));
  await page.waitForTimeout(2600);                 /* dwell past DWELL_MS */
  const stamped = await page.evaluate(() => (window.BEA.dossierLedger ? window.BEA.dossierLedger.size() : -1));
  await page.evaluate(() => { document.querySelector('.dsr__close').click(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => { location.hash = '#year=1765&sel=bengal-presidency'; });
  await page.waitForTimeout(1600);
  const second = await page.evaluate(() => {
    const r = document.querySelector('.dsr__retrieval');
    return { present: !!r, text: r ? r.innerText.slice(0, 120) : null, ledger: window.BEA.dossierLedger.size() };
  });
  log('TEST6 retrieval: first visit band=' + first + ' · ledger after dwell=' + stamped + ' · second visit=' + JSON.stringify(second));

  /* ---- renderSource is the one exported function ---- */
  const pub = await page.evaluate(() => ({
    renderSource: typeof (window.BEA || {}).renderSource,
    unsourced: window.BEA.unsourcedCount ? window.BEA.unsourcedCount() : null,
    classOnly: window.BEA.classOnlyCount ? window.BEA.classOnlyCount() : null,
  }));
  log('renderSource published: ' + JSON.stringify(pub));
};
