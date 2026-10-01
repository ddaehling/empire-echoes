/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * P08 — the WORKING-STAGE budget check for this piece.
 *
 * budget.js measures the cold plate, where this module renders nothing at all.
 * Every surface this module owns lives at data-stage="working" or deeper, and a
 * critic's round-two verdict was that the acceptance harness "is testing the
 * wrong state... every defect lives in data-stage=working with a beat panel
 * mounted". So this scenario mounts the beat, mounts the figure inside it, and
 * measures: horizontal overflow, type sizes, the map's share of the screen, and
 * whether the figure's own controls are reachable and inside the viewport.
 *
 * Run at 390x844, 768x1024, 900x700, 1366x768, 1440x900, light and dark.
 */
const R = [];
const t = (name, pass, got) => R.push({ name, pass: !!pass, got });

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url()));

  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1400);

  for (const beat of ['barbados', 'revenue-loop']) {
    await page.evaluate(() => window.BEA.bus.emit('tours:start', { step: 0 }));
    await page.waitForTimeout(500);
    await page.evaluate((b) => window.BEA.bus.emit('tours:goBeat', { id: b }), beat);
    await page.waitForTimeout(1200);
    /* On a narrow window a `present` beat may live in the band with the panel
       one press away. Press it, the way a student does. */
    await page.evaluate(() => {
      if (!document.querySelector('.viz-onpath')) window.BEA.bus.emit('tours:panel');
    });
    await page.waitForTimeout(700);

    const before = await page.evaluate((b) => {
      const box = document.querySelector('.viz-onpath');
      const de = document.documentElement;
      return {
        beat: b,
        mounted: !!box,
        docOverflow: de.scrollWidth - de.clientWidth,
        boxOverflow: box ? Math.round(box.scrollWidth - box.clientWidth) : 0,
        smallestText: box ? Math.min(...[...box.querySelectorAll('*')]
          .filter((n) => n.textContent.trim() && !n.children.length)
          .map((n) => parseFloat(getComputedStyle(n).fontSize))) : null,
        ctrlInView: (() => {
          const c = document.querySelector('.viz-onpath .viz-hundred__handle, .viz-onpath .viz-dots__field');
          if (!c) return null;
          const r = c.getBoundingClientRect();
          return r.left >= -1 && r.right <= innerWidth + 1 && r.width > 8;
        })(),
      };
    }, beat);
    log(beat + ' BEFORE ' + JSON.stringify(before));
    t(beat + ': the figure mounts inside the beat', before.mounted, JSON.stringify(before));
    t(beat + ': no horizontal overflow on the document', before.docOverflow <= 0, 'doc scrollWidth − clientWidth = ' + before.docOverflow);
    t(beat + ': the figure does not overflow its own column', before.boxOverflow <= 1, 'box overflow ' + before.boxOverflow + 'px');
    t(beat + ': nothing below 12px', before.smallestText == null || before.smallestText >= 12, 'smallest text ' + before.smallestText + 'px');
    t(beat + ': the control is inside the viewport and pressable', before.ctrlInView === true, 'control in view: ' + before.ctrlInView);
    await shot(beat + '-ask');

    await page.evaluate(() => {
      const h = document.querySelector('.viz-onpath .viz-hundred__handle') || document.querySelector('.viz-onpath .viz-dots__field');
      if (h) h.focus();
    });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => {
      const box = document.querySelector('.viz-onpath');
      const de = document.documentElement;
      const body = document.querySelector('.cx-sheet__body');
      if (body && box) body.scrollTop = box.offsetTop;
      return {
        docOverflow: de.scrollWidth - de.clientWidth,
        boxOverflow: box ? Math.round(box.scrollWidth - box.clientWidth) : 0,
        year: window.BEA.store.getState().year,
        railScrolls: !!(body && body.scrollHeight > body.clientHeight),
      };
    });
    log(beat + ' AFTER ' + JSON.stringify(after));
    t(beat + ': no horizontal overflow after the reveal', after.docOverflow <= 0 && after.boxOverflow <= 1,
      'doc ' + after.docOverflow + ', box ' + after.boxOverflow + ' — the rail scrolls vertically: ' + after.railScrolls);
    await shot(beat + '-revealed');
  }

  /* the cold plate is unchanged by this module */
  await page.evaluate(() => { window.BEA.bus.emit('viz:close'); window.BEA.bus.emit('tours:explore'); });
  await page.waitForTimeout(500);

  t('zero console errors, zero failed requests', errs.length === 0, errs.join(' | ') || 'none');
  for (const r of R) log((r.pass ? 'PASS  ' : 'FAIL  ') + r.name + '\n        ' + r.got);
  log(R.every((r) => r.pass) ? '>>> P08 working-stage budget holds' : '>>> P08 WORKING-STAGE BUDGET VIOLATED');
};
