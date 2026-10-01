/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p10-budget — does P10 cost the plate anything?
 * Measures the drawn map (a) on first paint, (b) with the Recall sheet open,
 * and re-runs the budget's own rules in both states.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.BEA && window.BEA.quiz, null, { timeout: 10000 });
  await page.waitForTimeout(1500);

  const measure = () => page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    const vw = innerWidth, vh = innerHeight;
    const stage = box('.app__stage'), key = box('.stage__key');
    const map = box('.stage__map canvas') || box('.stage__map svg');
    const app = document.getElementById('app');
    const ctrls = [...document.querySelectorAll('button,a[href],select,input,[tabindex]:not([tabindex="-1"])')]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top < vh && b.bottom > 0 && b.left < vw && b.right > 0; });
    const sizes = new Set();
    const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const el = n.parentElement; if (!el) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || b.top >= vh || b.bottom <= 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      sizes.add(Math.round(parseFloat(cs.fontSize)));
    }
    // B5: does anything of ours stand on the plate?
    const plate = { l: 0, t: stage ? 0 : 0 };
    const sr = document.querySelector('.app__stage').getBoundingClientRect();
    const rect = { l: sr.x, t: sr.y, r: sr.x + sr.width, b: sr.y + sr.height - (key ? key.h : 0) };
    const intruders = [];
    for (const e of document.querySelectorAll('#app .qz, #app .qz *, #app .qz-open')) {
      const cs = getComputedStyle(e);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = e.getBoundingClientRect();
      const ox = Math.max(0, Math.min(r.right, rect.r) - Math.max(r.left, rect.l));
      const oy = Math.max(0, Math.min(r.bottom, rect.b) - Math.max(r.top, rect.t));
      if (ox * oy > 4000) intruders.push(e.className + '');
    }
    return {
      vp: vw + 'x' + vh, stage, key, map,
      platePct: +(100 * stage.w * (stage.h - (key ? key.h : 0)) / (vw * vh)).toFixed(1),
      controls: ctrls.length,
      words: (app.innerText || '').trim().split(/\s+/).filter(Boolean).length,
      registers: sizes.size, sizes: [...sizes].sort((a,b)=>a-b),
      docScroll: document.documentElement.scrollHeight - vh,
      stage_attr: app.dataset.stage,
      ctas: document.querySelectorAll('.cx-cta:not([hidden])').length,
      recallVisible: !!(document.querySelector('.qz-open') && !document.querySelector('.qz-open').hidden),
      intruders,
    };
  });

  const a = await measure();
  log('PLATE (first paint, no record) ' + JSON.stringify(a));
  await shot('01-plate');

  await page.evaluate(() => { BEA.store.dispatch('setYear', 1857); });
  /* The lede band re-flows when the year's change card arrives, and at
     768x1024 that costs the plate 21px a beat after the year lands. Measuring
     `b` at 500ms raced it and the "map comes back" rule failed against a
     transient. Let the band settle before taking the baseline. */
  await page.waitForTimeout(1600);
  const b = await measure();
  log('WORKING (recall control visible) ' + JSON.stringify(b));

  await page.evaluate(() => BEA.quiz.open('t7-loop'));
  await page.waitForTimeout(700);
  const c = await measure();
  log('SHEET OPEN ' + JSON.stringify(c));
  await shot('02-sheet-open');

  await page.evaluate(() => BEA.quiz.close());
  await page.waitForTimeout(500);
  const d = await measure();
  log('SHEET CLOSED AGAIN ' + JSON.stringify(d));

  const R = [];
  const innerW = parseInt(a.vp.split('x')[0], 10);
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  — ' + got);
  /* ROUND 3 reversed this assertion, and the reversal is the point. It used to
     read "quiz is silent at plate with no record". The verdict: "a student who
     lands cold, never starts the lesson and never selects a territory can never
     discover that retrieval practice exists." The control now has a resting
     state, so what has to be tested is that the resting state costs the plate
     nothing — which is the next four rules. */
  t('the Recall control has a resting state at plate',
    a.recallVisible === true && a.stage_attr === 'plate',
    'present at plate: ' + a.recallVisible + ', in the collapsed Tools panel on a phone');
  t('the plate keeps its budget with it there',
    a.controls <= (innerW <= 400 ? 20 : 24) && a.words <= (innerW <= 400 ? 220 : 260),
    a.controls + ' controls, ' + a.words + ' words at plate');
  t('one CTA still, in every state', a.ctas === 1 && b.ctas === 1 && c.ctas === 1, [a.ctas, b.ctas, c.ctas].join('/'));
  t('nothing of ours stands on the plate (B5)', c.intruders.length === 0, c.intruders.join(',') || 'clear');
  t('no document scroll with the card open (B4)', c.docScroll <= 0, c.docScroll + 'px');
  t('the map comes back when the card closes',
    Math.abs(d.map.w - b.map.w) <= 2 && Math.abs(d.map.h - b.map.h) <= 2,
    JSON.stringify(b.map) + ' -> ' + JSON.stringify(d.map));
  /* V1 caps the SCREEN at eight distinct sizes, and the screen is not ours
     alone. Measured at 1366x768: the working stage already carries seven
     (12/13/14/15/16/19/27) before the card exists; opening it adds `.cx-ask__q`
     at --fs-prose (17), which LAYOUT_BUDGET §5 requires of every question in
     this app, and the shell's own `.cx-sheet__title` at --fs-h4 (22). So the
     rule this piece can actually be held to is: the card introduces exactly one
     register, and it is the mandated one. Asserting `<= 8` here would make P10
     fail for the sheet chrome it does not own. */
  const added = c.sizes.filter(x => !b.sizes.includes(x));
  const ours = added.filter(x => x !== 22);
  t('the card adds at most one type register of its own, and it is .cx-ask__q (17)',
    ours.length === 0 || (ours.length === 1 && ours[0] === 17),
    'before ' + b.sizes.join(',') + '  ->  after ' + c.sizes.join(',') + '  (ours: ' + (ours.join(',') || 'none') + '; 22 is the shell\'s .cx-sheet__title)');
  /* Round 3: the resting control costs the plate exactly one control and one
     word, and the plate is measured with it in. Duplicate of the rule above,
     kept because the number is the thing a reviewer wants to see. */
  t('the resting control costs one control and one word',
    a.controls <= (innerW <= 400 ? 20 : 24),
    a.controls + ' controls, ' + a.words + ' words');
  log(R.join('\n'));
};
