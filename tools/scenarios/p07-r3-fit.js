/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p07-r3-fit.js — P07's geometry, in the state the reader is actually in.
 *
 * Round 2's verdict: "the acceptance harness is testing the wrong state.
 * budget.js and shell-accept.js exercise the cold plate only; every defect
 * lives in data-stage=working with a panel mounted." So this one never looks
 * at the cold plate. It puts the app in `working`, opens each of this piece's
 * three surfaces in turn — the finder, an absence in the rail, and the index
 * of holes — and measures.
 *
 *   node tools/inspect.js tools/scenarios/p07-r3-fit.js --out /tmp/f390  --mobile
 *   node tools/inspect.js tools/scenarios/p07-r3-fit.js --out /tmp/f768  --w 768  --h 1024
 *   node tools/inspect.js tools/scenarios/p07-r3-fit.js --out /tmp/f900  --w 900  --h 700
 *   node tools/inspect.js tools/scenarios/p07-r3-fit.js --out /tmp/f1366 --w 1366 --h 768
 *   node tools/inspect.js tools/scenarios/p07-r3-fit.js --out /tmp/f1440 --w 1440 --h 900
 *
 * Prints PASS/FAIL and `>>> P07 fits` or `>>> P07 DOES NOT FIT`.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, note) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + note);

  await page.waitForFunction(() => window.BEA && window.BEA.search, null, { timeout: 20000 });
  await page.waitForTimeout(1200);

  /* The state a student is actually in: something has been touched. */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(400);

  const vp = page.viewportSize();
  const at = vp.width + 'x' + vp.height;

  /* A word that is cut in half by its own container teaches nothing. This
     finds any element of this piece whose text overflows horizontally. */
  const clipped = () => page.evaluate(() => {
    const out = [];
    const sel = '.sr__panel *, .cn *, .sr-sheet *, .lens *';
    for (const n of document.querySelectorAll(sel)) {
      if (!n.offsetParent && n.tagName !== 'BODY') continue;
      const over = n.scrollWidth - n.clientWidth;
      if (over > 2 && getComputedStyle(n).overflowX !== 'auto' && getComputedStyle(n).overflowX !== 'scroll') {
        out.push({ cls: String(n.className).slice(0, 40), over, text: (n.innerText || '').slice(0, 40) });
      }
    }
    return out.slice(0, 6);
  });

  const doc = () => page.evaluate(() => ({
    v: document.documentElement.scrollHeight - innerHeight,
    h: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));

  /* ---- 1. the finder, open, over a live map ----------------------------- */
  await page.evaluate(() => window.BEA.search.open('Kenya deaths 1954'));
  await page.waitForTimeout(500);
  await shot('01-finder');
  const p1 = await page.evaluate(() => {
    const p = document.querySelector('.sr__panel').getBoundingClientRect();
    return { x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: Math.round(p.height),
      vw: innerWidth, vh: innerHeight,
      placeholder: document.querySelector('.sr__input').placeholder,
      over: document.querySelector('.sr__list').dataset.over };
  });
  t('FIT.1 the finder stays inside the window at ' + at,
    p1.x >= 0 && p1.y >= 0 && p1.x + p1.w <= p1.vw + 1 && p1.y + p1.h <= p1.vh + 1,
    JSON.stringify(p1));
  const d1 = await doc();
  t('FIT.2 the open finder never makes the document scroll (B4)', d1.v <= 0 && d1.h <= 0, JSON.stringify(d1));
  const c1 = await clipped();
  t('FIT.3 nothing in the finder is cut off horizontally', c1.length === 0, JSON.stringify(c1));
  t('FIT.4 the field\'s own prompt fits the field',
    p1.w >= 460 ? /an event, a source/.test(p1.placeholder) : !/an event, a source/.test(p1.placeholder),
    p1.w + 'px · "' + p1.placeholder + '"');

  /* ---- 2. an absence in the rail, with the map still live --------------- */
  await page.evaluate(() => window.BEA.search.choose(0));
  await page.waitForTimeout(800);
  await shot('02-absence-sheet');
  const p2 = await page.evaluate(() => {
    const s = document.querySelector('.cx-sheet');
    const m = document.querySelector('.stage__map');
    const r = s && s.getBoundingClientRect();
    const mr = m && m.getBoundingClientRect();
    return {
      sheet: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
      map: mr ? { w: Math.round(mr.width), h: Math.round(mr.height) } : null,
      body: !!document.querySelector('.sr-sheet'),
      all: !!document.querySelector('.sr-sheet__all button'),
      vw: innerWidth, vh: innerHeight,
    };
  });
  t('FIT.5 the absence gets a rail surface of at least 280px (B8)',
    p2.sheet && p2.sheet.h >= 280 && p2.body, JSON.stringify(p2.sheet));
  t('FIT.6 the map is still drawn beside it', p2.map && p2.map.w > 0 && p2.map.h > 0, JSON.stringify(p2.map));
  t('FIT.7 an absence offers the route to all of them', p2.all, String(p2.all));
  const d2 = await doc();
  t('FIT.8 the rail surface never makes the document scroll', d2.v <= 0 && d2.h <= 0, JSON.stringify(d2));

  /* ---- 3. the index of holes, gated, then open -------------------------- */
  await page.evaluate(() => window.BEA.search.cannot());
  await page.waitForTimeout(700);
  await shot('03-index-gated');
  const g = await page.evaluate(() => ({
    gated: document.querySelector('.cn__gate').hidden,
    leak: /Somebody destroyed the record/.test(document.querySelector('.cn').innerText),
    slider: (() => { const s = document.querySelector('.cn__slider').getBoundingClientRect(); return { w: Math.round(s.width), h: Math.round(s.height) }; })(),
    commit: (() => { const b = document.querySelector('.cn__commit').getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })(),
  }));
  t('FIT.9 the counts are gated and do not leak into the DOM before the commit',
    g.gated === true && g.leak === false, JSON.stringify(g.gated) + '/' + g.leak);
  t('FIT.10 the commitment controls meet a 44px touch target',
    g.slider.h >= 44 && g.commit.h >= 44, JSON.stringify(g));

  await page.evaluate(() => { const s = document.querySelector('.cn__slider'); s.value = '100'; s.dispatchEvent(new Event('input')); });
  await page.click('.cn__commit');
  await page.waitForTimeout(400);
  await page.click('.cn__grp[data-shape="never-made"] .cn__toggle');
  await page.waitForTimeout(300);
  await shot('04-index-open');
  const c3 = await clipped();
  t('FIT.11 nothing in the index is cut off horizontally, with its longest group open',
    c3.length === 0, JSON.stringify(c3));
  const d3 = await doc();
  t('FIT.12 a 95-item group never makes the document scroll', d3.v <= 0 && d3.h <= 0, JSON.stringify(d3));
  const rows = await page.evaluate(() => {
    const l = document.querySelector('.cn__grp[data-shape="never-made"] .cn__list');
    return { n: l.querySelectorAll('.cn__go').length, h: Math.round(l.getBoundingClientRect().height), scroll: l.scrollHeight };
  });
  t('FIT.13 the longest group is capped and scrolls inside itself, not outside',
    rows.n > 50 && rows.h <= 400 && rows.scroll > rows.h, JSON.stringify(rows));

  /* ---- 4. the door -------------------------------------------------------- */
  const door = await page.evaluate(() => {
    const d = document.querySelector('.sr-door');
    const r = d.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), vw: innerWidth,
      kbd: !!d.querySelector('.sr-door__k') && d.querySelector('.sr-door__k').offsetParent !== null,
      label: d.getAttribute('aria-label') };
  });
  t('FIT.14 the door is inside the window and, on a phone, a 44px glyph with no keystroke chip',
    door.right <= door.vw && (door.vw >= 768 ? door.w > 48 : (door.w <= 48 && door.h >= 44 && !door.kbd))
    && /Find a place/.test(door.label || ''),
    JSON.stringify(door));

  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> P07 DOES NOT FIT' : '>>> P07 fits');
};
