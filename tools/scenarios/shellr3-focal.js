/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shellr3-focal`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: one filled control at a time inside the lesson. */
/** shellr3-focal — LAYOUT_BUDGET §6: exactly one filled madder-red control may
 *  exist in the viewport, the shell renders it, and it is the next thing to do.
 *  Counts filled accent controls across the states the round-3 pass touched. */
module.exports = async ({ page, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  const count = () => page.evaluate(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-ink').trim();
    const norm = (c) => c.replace(/\s/g, '').toLowerCase();
    const hits = [];
    for (const e of document.querySelectorAll('#app button, #app a[href], #app [role="button"]')) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = e.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > innerHeight) continue;
      const bg = norm(cs.backgroundColor);
      if (bg === 'rgba(0,0,0,0)' || bg === 'transparent') continue;
      // a filled control in the accent: compare against the token, resolved
      const probe = document.createElement('span');
      probe.style.color = accent; document.body.appendChild(probe);
      const target = norm(getComputedStyle(probe).color); probe.remove();
      if (bg === target) hits.push(((e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className) || e.tagName) + ' "' + (e.textContent || '').trim().slice(0, 28) + '"');
    }
    return { hits, cta: (() => { const c = document.querySelector('.cx-cta'); return c && !c.hidden ? ((c.dataset.quiet ? 'quiet ' : 'LOUD ') + (c.textContent || '').trim()) : null; })() };
  });
  const ready = async () => {
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
  };
  /* ROUND 2 OF WAVE 9: `#tour=thirty&step=9` and `&step=5` were typed here, on
     a route that has not been the default since wave 8, at step numbers that
     name a different surface on every other route — step 5 is not a gate
     anywhere except on `thirty`. The rule is about a MID-LESSON BEAT and a
     GATE, so both are found by kind on the route a cold start gives. */
  const RT = require('./lib/routes.js');
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  const routeId = (await RT.chosen(page))[0];
  const steps = await RT.stepsOf(page, routeId);
  const beats = steps.filter((x) => x.kind === 'beat');
  const midBeat = beats[Math.floor(beats.length / 2)];
  const gateStep = steps.find((x) => x.kind === 'gate');
  log('focal: ' + routeId + ' — mid beat at step ' + midBeat.step
    + (gateStep ? ', gate at step ' + gateStep.step : ', no gate on this route'));
  for (const [name, hash, wantLoud] of [
    ['cold plate', '#year=1900', true],
    ['a year, mid-atlas', '#year=1857&filter=stage:working', false],
    ['inside the lesson', '#tour=' + routeId + '&step=' + midBeat.step, false],
    ...(gateStep ? [['a gate', '#tour=' + routeId + '&step=' + gateStep.step, false]] : []),
  ]) {
    await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
    await ready();
    const c = await count();
    log(name + '  ' + JSON.stringify(c));
    t('F ' + name + ': at most one filled control', c.hits.length <= 1, c.hits.length + ' — ' + (c.hits.join(' | ') || 'none'), '<= 1');
    if (wantLoud) t('F ' + name + ': the focal control is loud', /^LOUD/.test(c.cta || ''), c.cta || '(none)', 'a filled madder-red control');
    else t('F ' + name + ': nothing is shouting', !/^LOUD/.test(c.cta || ''), c.cta || '(none)', 'quiet or absent');
  }
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> FOCAL PATH BROKEN' : '>>> focal path holds');
};
