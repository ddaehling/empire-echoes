/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05r3-gate.js — the round-3 gate defects, measured.
 *  1. the locked control keeps its label at every viewport
 *  2. the field is reachable and above the fold of the rail
 *  3. the floating transport does not sit on anyone else's controls
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1300);

  // walk to the first gate (step 5)
  await page.evaluate(() => window.BEA.bus.emit('tours:goBeat', { id: 'resistance' }));
  await page.waitForTimeout(800);
  await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (n && !n.disabled) n.click(); });
  await page.waitForTimeout(900);

  const g = await page.evaluate(() => {
    const next = document.querySelector('.tr-bar__next');
    const cue = document.querySelector('.tr-bar__togate');
    const field = document.querySelector('[data-gatefield="yes"]');
    const body = document.querySelector('.cx-sheet__body') || document.querySelector('.app__sheet');
    const vis = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const bodyR = body && body.getBoundingClientRect();
    const fR = field && field.getBoundingClientRect();
    // occlusion of other pieces' foot controls by our floating bar
    const bar = document.querySelector('.tr-dock[data-on="yes"][data-live="yes"] .tr-bar');
    let covered = [];
    if (bar) {
      const br = bar.getBoundingClientRect();
      for (const n of document.querySelectorAll('#app .map__defs > *, #app .map__modes > *')) {
        const r = n.getBoundingClientRect();
        if (r.width < 4) continue;
        const ox = Math.min(r.right, br.right) - Math.max(r.left, br.left);
        const oy = Math.min(r.bottom, br.bottom) - Math.max(r.top, br.top);
        if (ox > 0 && oy > 0) covered.push((n.textContent || '').trim().slice(0, 20) + ' ' + Math.round(ox * oy) + 'px2');
        const el2 = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
        if (el2 && el2.closest && el2.closest('.tr-bar')) covered.push('UNCLICKABLE ' + (n.textContent || '').trim().slice(0, 20));
      }
    }
    return {
      counter: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      nextText: (next && next.textContent.trim()) || '',
      nextWord: (next && next.querySelector('.tr-bar__w')) ? getComputedStyle(next.querySelector('.tr-bar__w')).position : 'none',
      nextWordBox: vis(next && next.querySelector('.tr-bar__w')),
      locked: !!(next && next.disabled), tab: next && next.getAttribute('tabindex'),
      cueShown: !!(cue && !cue.hidden), cueText: (cue && cue.textContent.trim()) || '',
      field: vis(field),
      bodyTop: bodyR ? Math.round(bodyR.top) : null, bodyBottom: bodyR ? Math.round(bodyR.bottom) : null,
      fieldAboveFold: !!(fR && bodyR && fR.top < bodyR.bottom),
      whyHidden: !!document.querySelector('.tr-gate__after[hidden]'),
      covered,
      dockLift: getComputedStyle(document.querySelector('.tr-dock') || document.body).getPropertyValue('--tr-dock-lift'),
      rail: document.getElementById('app').dataset.rail,
    };
  });
  log('GATE ' + JSON.stringify(g, null, 1));
  t('locked Next keeps a readable word', /Place it/.test(g.nextText) && g.nextWord !== 'absolute', 'text="' + g.nextText + '" wordPosition=' + g.nextWord);
  t('locked Next stays disabled and unfocusable', g.locked && g.tab === '-1', 'disabled=' + g.locked + ' tabindex=' + g.tab);
  t('a labelled route to the field exists', g.cueShown && /field/.test(g.cueText), '"' + g.cueText + '"');
  /* Beside a side rail the whole gate must fit without scrolling: that is the
     1440x900 defect. In the sheet band the rail is a short bottom sheet with
     its own scroll and the damaging fact is fifty-odd words, so the field
     cannot also be above the fold without cutting the fact — there the
     requirement is the labelled route, tested below. */
  t(g.rail === 'side' ? 'beside a side rail the field is in the window without scrolling'
                      : 'in the sheet band the field is in the rail, reached by the cue',
    g.rail === 'side' ? g.fieldAboveFold : g.cueShown,
    'rail=' + g.rail + ' field y=' + (g.field && g.field.y) + ' rail body bottom=' + g.bodyBottom);
  t('the app holds its own reading back until placement', g.whyHidden, 'why hidden=' + g.whyHidden);
  t('the floating transport covers nobody else\'s controls', g.covered.length === 0, g.covered.join(' | ') || 'nothing covered');
  await shot('gate-locked');

  // press the cue, then place
  await page.evaluate(() => document.querySelector('.tr-bar__togate')?.click());
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const f = document.querySelector('[data-gatefield="yes"] .tr-field__grid');
    const b = f && f.getBoundingClientRect();
    const box = b ? { y: Math.round(b.y), h: Math.round(b.height), bot: Math.round(b.bottom) } : null;
    return { box, vh: innerHeight, inView: !!(b && b.top >= 0 && b.bottom <= innerHeight + 4), focus: document.activeElement ? document.activeElement.className : '' };
  });
  t('the cue brings the nine cells into the window and focuses one', after.inView && /tr-field__cell/.test(after.focus), 'inView=' + after.inView + ' box=' + JSON.stringify(after.box) + ' vh=' + after.vh + ' focus=' + after.focus);
  await shot('gate-after-cue');
  await page.evaluate(() => document.querySelector('.tr-field__cell')?.click());
  await page.waitForTimeout(400);
  const placed = await page.evaluate(() => ({
    unlocked: !document.querySelector('.tr-bar__next').disabled,
    whyShown: !!document.querySelector('.tr-gate__after:not([hidden])'),
    done: (document.querySelector('.tr-gate__done') || {}).textContent || '',
  }));
  t('placing unlocks Next and reveals the reading', placed.unlocked && placed.whyShown, 'unlocked=' + placed.unlocked + ' why=' + placed.whyShown + ' "' + placed.done.slice(0, 40) + '"');
  await shot('gate-placed');
  log(R.join('\n'));
  log(R.some((r) => r.startsWith('FAIL')) ? '>>> GATE BROKEN' : '>>> gate holds');
};
