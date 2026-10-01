/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-map — the map band, measured, in the two states this piece can move
 *  it into: the cold plate, and the plate with our belief offer standing in
 *  the lede band. LAYOUT_BUDGET B1 is measured against the second, because the
 *  second is what a student who wandered off the path is actually looking at. */
module.exports = async ({ page, shot, log }) => {
  const measure = () => page.evaluate(() => {
    const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    const say = document.querySelector('.cx-lede__say');
    return {
      vh: innerHeight, vw: innerWidth,
      stage: box('.app__stage'), map: box('.stage__map canvas') || box('.stage__map svg') || box('.stage__map'),
      lede: box('.cx-lede'),
      sayText: say ? (say.textContent || '').replace(/\s+/g, ' ').trim() : null,
      sayClip: say ? say.scrollHeight > say.clientHeight + 1 : null,
    };
  });
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const cold = await measure();
  log('COLD PLATE   map ' + cold.map.w + 'x' + cold.map.h + '  = ' + (100 * cold.map.h / cold.vh).toFixed(1) + '% of ' + cold.vh + '   lede ' + cold.lede.h);
  await shot('cold');

  await page.evaluate(async () => {
    const mod = await import('/app/js/quiz/index.js');
    const q = mod.default;
    const forms = q._beliefForms.call(q, 'Borders drawn with a ruler explain what went wrong afterwards.');
    let i = 0; while (i < forms.length - 1 && !q._fits.call(q, forms[i])) i++;
    window.BEA.bus.emit('ask:say', { id: 'quiz:due', priority: 99, mark: 'Argue with it', text: forms[i], cta: { label: 'Ask me', emit: 'quiz:open' } });
  });
  await page.waitForTimeout(600);
  const withSay = await measure();
  log('WITH OFFER   map ' + withSay.map.w + 'x' + withSay.map.h + '  = ' + (100 * withSay.map.h / withSay.vh).toFixed(1) + '%   lede ' + withSay.lede.h + '  clipped=' + withSay.sayClip);
  log('             say: ' + withSay.sayText);
  log('DELTA to the plate from our sentence: ' + (withSay.map.h - cold.map.h) + 'px');
  await shot('with-offer');
};
