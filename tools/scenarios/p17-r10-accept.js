/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p17-legend`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P17: the byline, the provenance line and the legend fields. */
/* =============================================================================
   P17 ROUND 10 — the four claims this round makes.

   A1  NO GLYPH IS SPOKEN. No accessible name this module renders contains
       "deg ", a mid dot, an arrow, a chevron or "≈". The defect: a status row
       was spoken as "Company trading postsdeg 19".
   A2  NOTHING IS HALF-DRAWN. The colour list never overruns its own box, at
       any viewport, in any beat, at any year — RESPONSIVE_LAW §7's "a swatch
       that does not fit disappears rather than be cut".
   A3  THE STRIP IS ONE LINE. The one control sits on the swatches' own centre
       line and inside the strip: it carried `.cx-more`'s 16px block margin and
       was drawn 8px low and 1.4px past a 30px strip that clips.
   A4  IT DOES NOT RATCHET. Re-running the fit changes nothing.
   ========================================================================== */
const { axSession, axFor } = require('./p17-ax.js');

const GLYPH = /(^|\s)deg\s|·|→|←|▸|▾|≈/;

module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + (want ? '  (' + want + ')' : ''));
  const cdp = await axSession(page);

  const strip = () => page.evaluate(() => {
    const rib = document.querySelector('.legend--ribbon');
    if (!rib) return null;
    const list = rib.querySelector('.legend__ribbon-list');
    const route = rib.querySelector('.legend__route');
    const rb = rib.getBoundingClientRect();
    const lb = list.getBoundingClientRect();
    const cut = [...rib.querySelectorAll('.legend__rib')].filter(n => !n.hidden)
      .filter(n => n.getBoundingClientRect().right > lb.right + 1);
    const out = { over: list.scrollWidth - list.clientWidth, cut: cut.length,
      words: [...rib.querySelectorAll('.legend__rib')].filter(n => !n.hidden)
        .map(n => (n.querySelector('.legend__rib-w') || {}).textContent),
      label: route && !route.hidden ? route.textContent : null };
    if (route && !route.hidden) {
      const b = route.getBoundingClientRect();
      out.offCentre = Math.round(Math.abs((b.top + b.bottom) / 2 - (rb.top + rb.bottom) / 2));
      out.past = Math.round(Math.max(0, b.bottom - rb.bottom, rb.top - b.top));
    }
    return out;
  });

  const at = async (tag, url) => {
    await page.goto(url, { waitUntil: 'load' });
    try { await page.waitForSelector('.legend--ribbon', { timeout: 8000 }); } catch (e) { /* reported below */ }
    await page.waitForTimeout(2000);
    const s = await strip();
    if (!s) { t('A0 ribbon @ ' + tag, false, 'no .legend--ribbon'); return; }
    t('A2 nothing half-drawn @ ' + tag, s.over <= 1 && s.cut === 0,
      `overrun ${s.over}px, ${s.cut} cut, drew ${JSON.stringify(s.words)} beside ${JSON.stringify(s.label)}`, 'overrun 0, 0 cut');
    if (s.offCentre != null) {
      t('A3 control on the line @ ' + tag, s.offCentre <= 2 && s.past === 0,
        `${s.offCentre}px off centre, ${s.past}px past the strip`, '<=2px, 0px');
    }
    const names = [];
    for (const sel of ['.legend--ribbon .legend__rib', '.legend--ribbon .legend__route', '.legend__entry', '.lsheet .cx-more', '.byline', '.byline__crit']) {
      for (const r of await axFor(cdp, sel)) if (!r.error && !r.ignored && r.name) names.push([sel, r.name]);
    }
    const bad = names.filter(([, n]) => GLYPH.test(n));
    t('A1 no glyph spoken @ ' + tag, bad.length === 0,
      `${names.length} names inspected, ${bad.length} with a glyph` + (bad.length ? ' — ' + JSON.stringify(bad[0]) : ''), '0');
    await shot(tag.replace(/\W+/g, '_'));
  };

  await at('cold', 'http://localhost:8777/app/');
  await at('beat1', 'http://localhost:8777/app/#tour=thirty&step=1');
  await at('beat9', 'http://localhost:8777/app/#tour=thirty&step=9');
  await at('1783', 'http://localhost:8777/app/#year=1783');
  await at('1620', 'http://localhost:8777/app/#year=1620');

  /* With the sheet open — the state that costs the strip the most width. */
  await page.evaluate(() => document.querySelector('.legend__route')?.click());
  await page.waitForTimeout(1500);
  const s2 = await strip();
  t('A2 nothing half-drawn @ sheet open', s2 && s2.over <= 1 && s2.cut === 0,
    `overrun ${s2 && s2.over}px, ${s2 && s2.cut} cut`, 'overrun 0, 0 cut');
  for (const r of await axFor(cdp, '.legend__entry')) {
    if (r.ignored) continue;
    if (GLYPH.test(r.name)) { t('A1 status row spoken', false, JSON.stringify(r.name), 'no glyph'); break; }
  }
  await shot('sheet');

  /* A4 — the fit is idempotent: re-running it must not change the answer. */
  const twice = await page.evaluate(async () => {
    const before = document.querySelector('.legend--ribbon').outerHTML;
    const mod = await import('/app/js/legend/ribbon.js');
    mod.fitRibbon(document.querySelector('.legend--ribbon'));
    mod.fitRibbon(document.querySelector('.legend--ribbon'));
    return before === document.querySelector('.legend--ribbon').outerHTML;
  });
  t('A4 the fit does not ratchet', twice, twice ? 'identical after two more passes' : 'the strip changed', 'identical');

  R.forEach(l => log(l));
  log(R.some(l => l.startsWith('FAIL')) ? '>>> P17 R10 FAILED' : `>>> P17 R10 holds (${R.length} checks)`);
};
