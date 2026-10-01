/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P18 round-6 measurement — reproduce the round-3 panel's compare defects.
 * node tools/inspect.js tools/scenarios/p18r6-measure.js --out /tmp/x --mobile
 */
const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';
const BEAT = 'http://localhost:8777/app/#tour=thirty&step=9';

module.exports = async ({ page, shot, log }) => {
  const w = page.viewportSize().width, h = page.viewportSize().height;
  log(`viewport ${w}x${h}`);
  const errs = []; page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));

  await page.goto(BEAT, { waitUntil: 'load' });
  await page.waitForFunction(READY);
  await page.waitForTimeout(1200);

  const MAP = () => page.evaluate(() => {
    const b = (s) => { const n = document.querySelector(s); if (!n) return null;
      const r = n.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height) }; };
    return { stageMap: b('.stage__map'), canvas: b('.map__canvas, .stage__map canvas'), cmp: b('.cmp') };
  });
  log('BEFORE compare: map = ' + JSON.stringify(await MAP()));

  // launcher visibility
  const launch = await page.evaluate(() => {
    const n = document.querySelector('.cmp__launch');
    if (!n) return { present: false };
    const r = n.getBoundingClientRect(); const cs = getComputedStyle(n);
    return { present: true, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width),
      h: Math.round(r.height), display: cs.display, visibility: cs.visibility,
      parent: n.parentElement && n.parentElement.className, tabbable: n.tabIndex >= 0 && cs.display !== 'none',
      offsetParent: !!n.offsetParent };
  });
  log('LAUNCHER ' + JSON.stringify(launch));

  await page.keyboard.press('v');
  await page.waitForTimeout(1400);
  await shot('ask');

  const M = () => page.evaluate(() => {
    const box = (n) => { if (!n) return null; const r = n.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const q = (s) => box(document.querySelector(s));
    const cmp = document.querySelector('.cmp');
    const sides = [...document.querySelectorAll('.cmp__side')].map(box);
    const plates = [...document.querySelectorAll('.cmp__plate')].map(box);
    const pk = document.querySelector('.cmp__picker');
    const chips = pk ? [...pk.querySelectorAll('.cmp__pick')].map((c) => {
      const r = c.getBoundingClientRect(); return { t: c.textContent.trim().slice(0, 24),
        x: Math.round(r.x), r: Math.round(r.right), w: Math.round(r.width) }; }) : [];
    const scrollers = [...document.querySelectorAll('.cmp *, .cmp')].filter((n) =>
      n.scrollHeight > n.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(n).overflowY))
      .map((n) => ({ cls: n.className, ch: n.clientHeight, sh: n.scrollHeight }));
    const small = [...document.querySelectorAll('.cmp button, .cmp a[href], .cmp [role=button]')]
      .map((n) => { const r = n.getBoundingClientRect(); return { t: (n.textContent||'').trim().slice(0,22),
        w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter((o) => o.w > 0 && (o.w < 24 || o.h < 24));
    return { phase: cmp && cmp.dataset.phase, cmp: q('.cmp'), grid: q('.cmp__grid'),
      plates: q('.cmp__plates'), sides, plateBoxes: plates, ask: q('.cmp__ask'),
      delta: q('.cmp__delta'), bar: q('.cmp__bar'),
      picker: { box: q('.cmp__picker'), sw: pk ? pk.scrollWidth : 0, cw: pk ? pk.clientWidth : 0, chips },
      scrollers, small };
  });
  log('ASK ' + JSON.stringify(await M(), null, 1));

  // commit
  const c = await page.$('.cmp__choice');
  if (c) { await c.click(); await page.waitForTimeout(1400); }
  await shot('reveal');
  log('REVEAL ' + JSON.stringify(await M(), null, 1));
  log('MAP with compare open: ' + JSON.stringify(await MAP()));
  log('errors ' + errs.length + (errs.length ? ' :: ' + errs.join(' | ') : ''));
};
