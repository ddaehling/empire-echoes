/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-lede — the quiz's own lede-band sentences, in the real band, at the
 *  real width, against the real clamp. Drives the module's own ladder rather
 *  than a hand-written string, so it measures what a student gets. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1857&sel=jamaica', { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  const beliefs = await page.evaluate(() => window.__qzBeliefs || null);
  const list = beliefs || [
    ['M15', 'Borders drawn with a ruler explain what went wrong afterwards.'],
    ['M3', 'Decolonisation was a peaceful, planned handover — Britain decided to leave.'],
    ['M13', 'The Commonwealth is what the empire naturally became — a family of friends.'],
    ['M7', 'The empire brought railways, law and English, so it developed the colonies.'],
    ['M11', 'Empire made ordinary British people rich.'],
    ['M2', 'India was conquered by the British government.'],
  ];
  let worst = 0;
  for (const [id, belief] of list) {
    const m = await page.evaluate(async (b) => {
      const mod = await import('/app/js/quiz/index.js');
      const q = mod.default;
      /* the ladder, and the module's own fitter, on the live band */
      const forms = q._beliefForms.call(q, b);
      const fits = forms.map((f) => q._fits.call(q, f));
      const pick = Math.max(0, fits.findIndex(Boolean) === -1 ? forms.length - 1 : fits.findIndex(Boolean));
      window.BEA.bus.emit('ask:say', { id: 'quiz:due', priority: 99, mark: 'Argue with it', text: forms[pick], cta: { label: 'Ask me', emit: 'quiz:open' } });
      return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const s = document.querySelector('.cx-lede__say');
        res({
          rung: pick, rungs: forms.length, fits,
          shown: (s.textContent || '').replace(/\s+/g, ' ').trim(),
          clientH: s.clientHeight, scrollH: s.scrollHeight, w: Math.round(s.clientWidth),
        });
      })));
    }, belief);
    const cut = m.scrollH > m.clientH + 1;
    if (cut) worst++;
    log(id + ' rung ' + m.rung + '/' + (m.rungs - 1) + ' fits=' + JSON.stringify(m.fits) + ' box ' + m.w + 'x' + m.clientH + ' need ' + m.scrollH + (cut ? '  *** STILL CLIPPED' : '  ok'));
    log('    ON SCREEN: ' + m.shown);
    await shot('lede-' + id);
  }
  log('clipped: ' + worst + ' of ' + list.length);
};
