/* P16 acceptance: all 14 arguments render, commit and reveal, at any viewport. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.bus && window.BEA.historiography && document.getElementById('app').dataset.rail, null, { timeout: 20000 });
  await page.waitForTimeout(900);

  const vp = await page.evaluate(() => ({ vw: innerWidth, vh: innerHeight, rail: document.getElementById('app').dataset.rail }));
  log('viewport ' + vp.vw + 'x' + vp.vh + ' rail=' + vp.rail);

  /* the cold plate, before anything of ours is on screen */
  const cold = await page.evaluate(() => {
    const m = document.querySelector('.stage__map'); const b = m.getBoundingClientRect();
    const c = document.querySelector('.stage__map canvas');
    const cb = c && c.getBoundingClientRect();
    return { rect: [Math.round(b.width), Math.round(b.height)], canvas: cb ? [Math.round(cb.width), Math.round(cb.height)] : null };
  });
  log('MAP cold  .stage__map ' + cold.rect.join('x') + '  drawn ' + (cold.canvas ? cold.canvas.join('x') : 'n/a'));

  await page.evaluate(() => { location.hash = '#panel=historiography'; });
  await page.waitForTimeout(900);

  const withPanel = await page.evaluate(() => {
    const m = document.querySelector('.stage__map'); const b = m.getBoundingClientRect();
    const c = document.querySelector('.stage__map canvas');
    const cb = c && c.getBoundingClientRect();
    return { rect: [Math.round(b.width), Math.round(b.height)], canvas: cb ? [Math.round(cb.width), Math.round(cb.height)] : null };
  });
  log('MAP panel .stage__map ' + withPanel.rect.join('x') + '  drawn ' + (withPanel.canvas ? withPanel.canvas.join('x') : 'n/a'));

  /* THIS MODULE'S OWN FIELDS AND OWN PROSE. `audit()` also walks the plate's
     silences and the shards' bibliography, which this module reports on and
     does not own; those are printed below as NOTES, with the directory that
     has to fix them, so a red line here always means P16. */
  t('P16-audit', (await page.evaluate(() => window.BEA.historiography.auditOwn())).length === 0,
    JSON.stringify(await page.evaluate(() => window.BEA.historiography.auditOwn())));
  const cross = await page.evaluate(() => window.BEA.historiography.audit().filter((f) => f.piece !== 'P16'));
  log('cross-module findings from BEA.historiography.audit(): ' + cross.length);
  for (const f of cross) log('  NOTE [' + f.piece + '] ' + f.id + ' :: ' + f.problem);

  /* THE SILENCE GUARD, PROVEN RATHER THAN OBSERVED EMPTY.
     A check that only ever runs against a clean dataset is a check nobody has
     seen work. These two records are the two sentences the atlas actually held
     when this guard was written — Kenya's, which supports the headline, and
     the Bringing Them Home sentence, which does not — fed straight into
     auditSilences() through the same shape the plate hands it. */
  const guard = await page.evaluate(() => {
    const fake = (rows) => ({ module: { _derivedSilences: () => rows } });
    const good = [['kenya', { territoryId: 'kenya', agent: 'the colonial government in Nairobi',
      reason: 'Records were destroyed at independence and thousands more were removed to Britain and concealed until 2011.' }]];
    const hedged = [['au-nsw', { territoryId: 'au', agent: null,
      reason: 'The 1997 Bringing Them Home inquiry said a precise number could not be given because records were poor and many were destroyed.' }]];
    const denied = [['au-nsw', { territoryId: 'au', agent: null,
      reason: 'The inquiry did not find that the record had been systematically destroyed, and it named no destroyer.' }]];
    const noagent = [['x', { territoryId: 'x', agent: null,
      reason: 'Every register was destroyed by order in 1963.' }]];
    const A = window.BEA.historiography;
    return {
      good: A.auditSilences ? A.auditSilences(fake(good)).length : -1,
      hedged: A.auditSilences(fake(hedged)).length,
      denied: A.auditSilences(fake(denied)).length,
      noagent: A.auditSilences(fake(noagent)).length,
      blind: A.auditSilences({}).length,
    };
  });
  t('P16-silence-guard', guard.good === 0 && guard.hedged === 1 && guard.denied === 1
    && guard.noagent === 1 && guard.blind === 1, JSON.stringify(guard));

  /* THE BIBLIOGRAPHY GUARD, proven the same way. The four shapes are the four
     that were actually in the shards when this was written: a subtitle dropped,
     an author's initials dropped, a full stop inside an abbreviation, and one
     book cited under two spellings in two different files. */
  const wg = await page.evaluate(() => {
    const ev = (a, w, y) => ({ author: a, work: w, year: y, supports: 'x', check: 'x' });
    const D = (evs) => ({ territories: [{ id: 't', evidence: evs, acquisitions: [], departures: [] }], events: [] });
    const A = window.BEA.historiography;
    return {
      clean: A.auditWorks(D([ev('Abdul Sheriff', 'Slaves, Spices and Ivory in Zanzibar', 1987),
        ev('David Anderson', 'Histories of the Hanged', 2005)])).length,
      subtitle: A.auditWorks(D([ev('Abdul Sheriff', 'Slaves, Spices and Ivory in Zanzibar', 1987),
        ev('Abdul Sheriff', 'Slaves, Spices and Ivory in Zanzibar: Integration of an East African Commercial Empire', 1987)])).length,
      initials: A.auditWorks(D([ev('Juan Cole', 'Colonialism and Revolution in the Middle East', 1993),
        ev('Juan R. I. Cole', 'Colonialism and Revolution in the Middle East', 1993)])).length,
      stops: A.auditWorks(D([ev('Ervand Abrahamian', 'The Coup: the Roots of Modern US-Iranian Relations', 2013),
        ev('Ervand Abrahamian', 'The Coup: the Roots of Modern U.S.-Iranian Relations', 2013)])).length,
      /* Two different books by one author in one year must NOT collapse. */
      distinct: A.auditWorks(D([ev('John Darwin', 'The Empire Project', 2009),
        ev('John Darwin', 'After Tamerlane', 2009)])).length,
    };
  });
  t('P16-works-guard', wg.clean === 0 && wg.subtitle === 1 && wg.initials === 1 && wg.stops === 1
    && wg.distinct === 0, JSON.stringify(wg));

  /* THE ATTRIBUTION GUARD, proven the same way, and it is the fourth surface of
     the gloss class: a display that contradicts the record printed under it.
     Round 3's historian found `Africa and the Victorians` credited to two
     authors in the line the student reads and to three — with Alice Denny — in
     the check line six lines below. The five fixtures are the five shapes that
     matter: the defect itself, the reverse of it (which is NOT a defect, because
     a primary source prints its speaker and cites the volume), a short given
     name, a citation that names another work first, and a badge whose year is
     not the year of the work under it. */
  const ag = await page.evaluate(() => {
    const A = window.BEA.historiography;
    const one = (src, badge) => A.auditAttribution([{ id: 'fx', positions: [{ key: 'p', badge: badge || null, src }] }], []).length;
    return {
      live: A.attributionStats(),
      /* the Denny shape: the check credits somebody the author line drops */
      dropped: one({ author: 'Ronald Robinson and John Gallagher', work: 'Africa and the Victorians', year: 1961,
        check: 'Ronald Robinson and John Gallagher with Alice Denny, Africa and the Victorians (London, 1961).' }),
      /* the reverse, which is correct citation practice and must not fire */
      reported: one({ author: 'Samuel Sharpe, reported by Henry Bleby', work: 'Death Struggles of Slavery', year: 1853,
        check: 'Henry Bleby, Death Struggles of Slavery (London, 1853).' }),
      /* "Sol" is not a fourth Plaatje */
      shortform: one({ author: 'Solomon Tshekisho Plaatje', work: 'Native Life in South Africa', year: 1916,
        check: 'Sol T. Plaatje, Native Life in South Africa (London, 1916).' }),
      /* a check that names an article before the book is not an author list */
      otherwork: one({ author: 'D. K. Fieldhouse', work: 'Economics and Empire 1830-1914', year: 1973,
        check: 'D. K. Fieldhouse, “An Historiographical Revision”, EcHR 14 (1961); and Economics and Empire 1830–1914 (London, 1973).' }),
      /* the check names the work and nobody above it */
      orphan: one({ author: 'Catherine Hall and Nicholas Draper', work: 'Legacies of British Slave-ownership', year: 2014,
        check: 'The Legacies of British Slavery database, University College London.' }),
      /* the badge names a year the citation does not */
      badge: one({ author: 'Jane Doe', work: 'A Book About Things', year: 1991,
        check: 'Jane Doe, A Book About Things (London, 1991).' }, 'A Book, 1990'),
      /* the sentence about the work disagrees with the locator under it —
         found by reading the screen: the 1953 article is fifteen pages, and
         the line above it said sixteen */
      pages: one({ author: 'John Gallagher and Ronald Robinson', work: 'The Imperialism of Free Trade', year: 1953,
        nature: 'A journal article, sixteen pages, aimed squarely at other historians.',
        check: 'John Gallagher and Ronald Robinson, The Imperialism of Free Trade, Economic History Review, 2nd ser., 6:1 (1953), 1–15.' }),
      pagesok: one({ author: 'John Gallagher and Ronald Robinson', work: 'The Imperialism of Free Trade', year: 1953,
        nature: 'A journal article, fifteen pages, aimed squarely at other historians.',
        check: 'John Gallagher and Ronald Robinson, The Imperialism of Free Trade, Economic History Review, 2nd ser., 6:1 (1953), 1–15.' }),
    };
  });
  t('P16-attribution-guard', ag.dropped === 1 && ag.reported === 0 && ag.shortform === 0
    && ag.otherwork === 0 && ag.orphan === 1 && ag.badge === 1 && ag.pages === 1 && ag.pagesok === 0,
    JSON.stringify(ag));
  t('P16-attribution-clean', ag.live.findings === 0 && ag.live.citations === 82,
    JSON.stringify(ag.live) + ' — every citation this module prints, plus the dossier’s 43 primary texts');

  const ids = await page.evaluate(() => window.BEA.historiography.disputes.map(d => d.id));
  t('P16-count', ids.length === 14, ids.length + ' arguments');

  let bad = [];
  const reach = [];   /* round 3: is our own pager reachable, or is something on top of it? */
  const band = [];    /* round 3: the reading window, measured, and what it decided */
  /* THE FOUR LINES THE STUDENT WRITES, INSIDE AN ARGUMENT. produce.js, and the
     other half of CONTRACT §9 — the beat mount is proved by produce.scenario.js.
     Four of the fourteen carry an exercise, it stands before the commitment,
     and this atlas's own four answers about the document are NOT in the DOM
     until the student has written four of their own. The loop above has already
     judged all fourteen, so this opens one afresh and checks the whole cycle in
     the surface a reader actually meets it on. */
  const src = await page.evaluate(async () => {
    const set = window.BEA.historiography.sources();
    const ex = set[0];
    window.BEA.historiography.open(ex.dispute);
    await new Promise((r) => setTimeout(r, 300));
    const root = document.querySelector('.hgx');
    const t = (window.BEA.testimony && window.BEA.testimony.texts || []).find((x) => x.id === ex.doc);
    const before = {
      exercises: set.length,
      boxes: root.querySelectorAll('textarea[data-hgx="srcfield"]').length,
      cmp: root.querySelectorAll('.hgx-src__cmp').length,
      /* textContent, not innerText: "not in the DOM" is the rule, and a
         chapter that is `hidden` is still in the DOM. innerText would skip it
         and the check would pass on a leak. */
      quote: root.textContent.indexOf(String(t.quote).slice(0, 30)) >= 0,
      leak: root.textContent.indexOf(String(t.nature).slice(0, 40)) >= 0
        || root.textContent.indexOf(String(t.purpose).slice(0, 40)) >= 0,
      go: root.querySelector('.hgx-src__go').disabled,
    };
    for (const ta of root.querySelectorAll('textarea[data-hgx="srcfield"]')) {
      ta.value = 'A sentence of my own about ' + ta.dataset.field + ', long enough to count.';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const armed = !document.querySelector('.hgx-src__go').disabled;
    document.querySelector('.hgx-src__go').click();
    await new Promise((r) => setTimeout(r, 400));
    const root2 = document.querySelector('.hgx');
    const cards = [...root2.querySelectorAll('.hgx-src__cmp')];
    return {
      before,
      armed,
      cards: cards.length,
      whole: cards.every((c) => c.querySelector('.hgx-src__side[data-who="you"] .hgx-src__said')
        && c.querySelector('.hgx-src__side[data-who="atlas"] .hgx-src__said')
        && c.querySelector('.hgx-src__strong') && c.querySelector('.hgx-src__weak')),
      ours: root2.textContent.indexOf(String(t.nature).slice(0, 40)) >= 0,
      canonical: !!root2.querySelector('.hgx-src__whole .src'),
      /* The ARGUMENT is untouched by the exercise's commitment: still gated,
         still no verdict, and the student still has to judge the historians. */
      verdict: !!root2.querySelector('.hgx-verdict'),
      ask: !!root2.querySelector('.hgx-ask'),
    };
  });
  t('P16-source-production',
    src.before.exercises >= 3 && src.before.boxes === 4 && src.before.cmp === 0
      && src.before.quote && src.before.leak === false && src.before.go === true
      && src.armed && src.cards === 4 && src.whole && src.ours && src.canonical
      && src.verdict === false && src.ask === true,
    JSON.stringify(src));

  for (const id of ids) {
    await page.evaluate((i) => window.BEA.historiography.open(i), id);
    await page.waitForTimeout(190);
    const pre = await page.evaluate(() => {
      const root = document.querySelector('.hgx');
      if (!root) return { err: 'no root' };
      const body = document.querySelector('.cx-sheet__body').getBoundingClientRect();
      const over = [];
      for (const e of root.querySelectorAll('*')) {
        const r = e.getBoundingClientRect();
        if (r.width && (r.right > body.right + 1 || r.left < body.left - 1)) over.push((e.className || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      }
      const cur = [...root.querySelectorAll('.hgx-chap')].filter(c => !c.hidden);
      const paged = !root.querySelector('.hgx-pager').hidden;
      return {
        q: !!root.querySelector('.hgx__q'), stake: !!root.querySelector('.hgx__stake'),
        shape: !!root.querySelector('.hgx-shape'),
        positions: root.querySelectorAll('.hgx-pos').length,
        reads: root.querySelectorAll('.hgx-pos__ev dd').length,
        ask: !!root.querySelector('.hgx-ask'),
        verdict: !!root.querySelector('.hgx-verdict'), settle: !!root.querySelector('.hgx-settle'),
        paged, visible: cur.length, chaps: root.querySelectorAll('.hgx-chap').length,
        over: over.slice(0, 3),
        maxChap: Math.max(...[...root.querySelectorAll('.hgx-chap')].map(c => { const w = c.hidden; c.hidden = false; const h = c.scrollHeight; c.hidden = w; return h; })),
        /* THE READING WINDOW THE STUDENT ACTUALLY HAS, and the tallest thing
           they are asked to read in it. Round 3: this used to be measured only
           against the width band, which could not see 900x700 or 1024x640. */
        win: (() => {
          let w = root.parentElement;
          for (let i = 0; w && i < 12; i += 1, w = w.parentElement) {
            const cs = getComputedStyle(w);
            if (/auto|scroll|overlay/.test(cs.overflowY) && w.clientHeight > 24) return w.clientHeight;
          }
          return 0;
        })(),
        shown: Math.round(Math.max(...cur.map(c => c.getBoundingClientRect().height), 0)),
        /* AND IS OUR OWN PAGER REACHABLE? At 390 the Close module's through-line
           block is sticky at z-index 4 inside the same 198px scroller, and Back
           and Next were drawn underneath it: a tap landed on `cl-blk__finish`. */
        onTop: paged ? ['-1', '1'].map((dir) => {
          const b = root.querySelector('.hgx-pager [data-dir="' + dir + '"]').getBoundingClientRect();
          const hit = document.elementFromPoint(Math.round(b.x + b.width / 2), Math.round(b.y + b.height / 2));
          return hit && root.contains(hit) ? 'ok' : String((hit && hit.className) || 'nothing');
        }) : ['unpaged', 'unpaged'],
      };
    });
    if (!pre.err) {
      band.push(id + ' ' + (pre.paged ? 'chaptered' : 'one column') + ' win=' + pre.win
        + ' shown=' + pre.shown + ' ratio=' + (pre.win ? (pre.shown / pre.win).toFixed(1) : '?'));
      if (pre.paged && pre.win && pre.shown > pre.win * 3) reach.push(id + ' RATIO ' + (pre.shown / pre.win).toFixed(1));
      if (!pre.paged && pre.win && pre.maxChap > pre.win * 6) reach.push(id + ' UNPAGED RATIO ' + (pre.maxChap / pre.win).toFixed(1));
      if (pre.onTop.some((o) => o !== 'ok' && o !== 'unpaged')) reach.push(id + ' PAGER UNDER ' + pre.onTop.join('/'));
    }
    if (pre.err || !pre.q || !pre.stake || !pre.shape || pre.positions < 1 || !pre.ask || pre.verdict || pre.settle || pre.over.length
        || (pre.paged && pre.visible !== 1) || (!pre.paged && pre.visible !== pre.chaps)) {
      bad.push(id + ' PRE ' + JSON.stringify(pre));
    }
    /* commit */
    const post = await page.evaluate(() => {
      document.querySelector('.hgx-choice').click();
      const ta = document.querySelector('textarea[data-hgx="why"]');
      ta.value = 'x'.repeat(19);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      const stillLocked = document.querySelector('.hgx-ask .hgx-ask__go').disabled;
      ta.value = 'Because it accounts for the record the other one has to keep explaining away.';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      const nowOpen = !document.querySelector('.hgx-ask .hgx-ask__go').disabled;
      document.querySelector('.hgx-ask .hgx-ask__go').click();
      return { stillLocked, nowOpen };
    });
    await page.waitForTimeout(320);
    const rev = await page.evaluate(() => {
      const root = document.querySelector('.hgx');
      return {
        verdict: !!root.querySelector('.hgx-verdict'), settle: !!root.querySelector('.hgx-settle'),
        key: !!root.querySelector('.hgx-settle__key'), mine: !!root.querySelector('.hgx-mine__why'),
        ask: !!root.querySelector('.hgx-ask'),
        maxChap: Math.max(...[...root.querySelectorAll('.hgx-chap')].map(c => { const w = c.hidden; c.hidden = false; const h = c.scrollHeight; c.hidden = w; return h; })),
        chaps: root.querySelectorAll('.hgx-chap').length,
      };
    });
    if (!post.stillLocked || !post.nowOpen || !rev.verdict || !rev.settle || !rev.key || !rev.mine || rev.ask) {
      bad.push(id + ' POST ' + JSON.stringify(post) + JSON.stringify(rev));
    }
    log(id + '  pre chaps=' + pre.chaps + ' max=' + pre.maxChap + '  post chaps=' + rev.chaps + ' max=' + rev.maxChap
      + (pre.over.length ? '  OVERFLOW ' + pre.over.join(' | ') : ''));
  }
  t('P16-all-14', bad.length === 0, bad.length ? bad.join('  ///  ') : 'every argument rendered, gated and revealed');

  /* THE PARALLEL TEXTS SURVIVE THE JUDGEMENT. Both instances, both halves.
     FEATURE_SPEC §2 P16 test 5 asks for clause locking and the third column on
     the far side of nothing in particular; before this round they were built
     only into the pre-commit half, so a student who judged lost them. */
  const par = await page.evaluate(async () => {
    const out = {};
    for (const id of ['waitangi-texts', 'the-scramble']) {
      window.BEA.historiography.open(id);
      await new Promise((r) => setTimeout(r, 260));
      const root = document.querySelector('.hgx');
      out[id] = {
        blocks: root.querySelectorAll('.hgx-par').length,
        pairs: root.querySelectorAll('.hgx-pair').length,
        marks: root.querySelectorAll('.hgx-seg').length,
        warn: !!root.querySelector('.hgx-par .cx-note--warn'),
      };
      const s = root.querySelector('.hgx-seg');
      if (s) { s.click(); await new Promise((r) => setTimeout(r, 60));
        out[id].lit = document.querySelectorAll('.hgx-seg[aria-pressed="true"]').length; }
    }
    return out;
  });
  const parOk = Object.values(par).every((v) => v.blocks >= 3 && v.pairs >= 2 && v.marks >= 4 && !v.warn && v.lit >= 4);
  t('P16-parallel-after', parOk, JSON.stringify(par));

  /* NO LINE OF PROSE CUT THROUGH THE MIDDLE BY THE PAGER BAR.
     The bar is sticky and opaque; where a line ends under its top edge the
     reader used to get the tops of the letters and nothing else. Measured, not
     eyeballed: the gradient that dissolves that line has to exist. */
  const seam = await page.evaluate(() => {
    const pager = document.querySelector('.hgx-pager');
    if (!pager || pager.hidden) return { paged: false, fade: null };
    const st = getComputedStyle(pager, '::before');
    return { paged: true, fade: st.backgroundImage, h: st.blockSize || st.height };
  });
  t('P16-no-sliced-line', !seam.paged || /gradient/.test(String(seam.fade)),
    seam.paged ? 'pager fade ' + seam.h + ' ' + String(seam.fade).slice(0, 46) : 'not in the paged band');

  band.forEach((l) => log('  band  ' + l));
  t('P16-band', reach.length === 0, reach.length ? reach.join(' ; ')
    : 'every argument fits its own reading window, and the pager is on top of whatever else is pinned there');

  /* the ledger got them */
  const led = await page.evaluate(() => window.BEA.historiography.judgements().length);
  t('P16-ledger', led === 14, led + ' judgements recorded');

  await shot('accept-end');
  R.forEach(l => log(l));
  log(R.some(l => l.startsWith('FAIL')) ? '>>> P16 ACCEPTANCE BROKEN' : '>>> P16 acceptance holds');
};
