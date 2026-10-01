/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* =============================================================================
   P17 — THE ACCESSIBLE-NAME AUDIT OF THE WHOLE LEGEND MODULE.

   It prints the SPOKEN NAME of every control, entry and mark this module
   renders — from Chromium's own accname implementation over CDP, not from a
   guess about what the DOM ought to compute to.

   It exists because of one defect and the class of defect behind it: a status
   row in the sheet was spoken as "Company trading postsdeg 19" — a printed
   badge ("deg 1"), a bare numeral (14 units), and a mid dot that comes out of a
   stylesheet, all of them visual devices, all of them in the name, with the
   words they stand for parked on `title`s that a name computation never reads.

     node tools/inspect.js tools/scenarios/p17-a11y-audit.js --out /tmp/a11y
     node tools/inspect.js tools/scenarios/p17-a11y-audit.js --out /tmp/a11y-m --mobile

   RULE: no accessible name in this module may contain `deg`, a lone numeral, a
   mid dot, an arrow, a chevron or `≈`. It prints PASS/FAIL on that and
   `>>> the legend speaks in words` / `>>> A GLYPH IS BEING SPOKEN`.
   ========================================================================== */
const { axSession, axFor } = require('./p17-ax.js');

/* A name is wrong if a printed mark got into it. `·` and `→` are the two this
   module actually prints; `deg N` is the badge that started this. */
const GLYPH = /(^|\s)deg\s|·|→|←|▸|▾|≈|×(?!\s?\d)/;
/* "Ruled from London 94" — a numeral with no noun after it, at the end. */
const BARE_NUMERAL = /\d[\d,.]*\s*$/;

module.exports = async ({ page, shot, log }) => {
  const cdp = await axSession(page);
  const bad = [];
  const seen = [];

  const show = async (label, sel, { numerals = true } = {}) => {
    const rows = await axFor(cdp, sel);
    const live = rows.filter(r => !r.error && !r.ignored);
    log(`\n### ${label}   (${sel})  — ${live.length} spoken of ${rows.length}`);
    for (const r of live) {
      const flag = GLYPH.test(r.name) ? '  <<< GLYPH IN NAME'
        : (numerals && BARE_NUMERAL.test(r.name) && r.name.length > 2) ? '  <<< BARE NUMERAL' : '';
      if (flag) bad.push(`${label}: <${r.tag} class="${r.cls}"> ${JSON.stringify(r.name)}${flag}`);
      seen.push(r.name);
      log(`  <${r.tag} class="${r.cls}"> role=${r.role} NAME=${JSON.stringify(r.name)}${flag}`);
    }
  };

  await page.goto('http://localhost:8777/app/#year=1700', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  log('=== THE RIBBON, at data-stage="plate" ===');
  await show('ribbon group', '.legend--ribbon');
  await show('ribbon entries', '.legend--ribbon .legend__rib');
  await show('ribbon control', '.legend--ribbon .legend__route');

  /* The sheet. The route is withdrawn at `plate` when the key is whole, so it
     is opened directly rather than through a hit test that depends on it. */
  await page.evaluate(() => document.querySelector('.legend__route')?.click());
  await page.waitForTimeout(1800);
  await shot('sheet');
  log('\n=== THE SHEET: the fourteen legal forms ===');
  await show('status rows', '.legend__entry');
  log('\n=== THE SHEET: figures, marks, the tenure ramp ===');
  await show('the rule in force', '.legend__rule-line, .legend__figures, .legend__anchor');
  await show('mark rows', '.legend__row--strong .legend__entry--static, .legend__entry--static');
  await show('tenure ramp', '.legend__ramp-step');
  await show('sheet routes', '.lsheet .cx-more');

  const first = await page.$('.legend__entry');
  if (first) { await first.click({ force: true }); await page.waitForTimeout(900); }
  await shot('row-open');
  log('\n=== A ROW OPENED ===');
  await show('the opened row', '.legend__entry[aria-pressed="true"]');
  await show('its roll of places', '.legend__roll-list li');

  /* The byline: apparatus only, and only at 62rem and up. */
  await page.goto('http://localhost:8777/app/#year=1900&filter=stage:apparatus', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  log('\n=== THE BYLINE, at data-stage="apparatus" ===');
  await show('byline', '.byline');
  await show('byline fields', '.byline__item');
  log('byline text: ' + JSON.stringify(await page.evaluate(() => {
    const b = document.querySelector('.byline'); return b ? b.innerText.replace(/\n+/g, ' | ') : null;
  })));
  await shot('byline');

  log('\n=== VERDICT ===');
  log('names inspected: ' + seen.length);
  if (bad.length) { bad.forEach(b => log('FAIL  ' + b)); log('>>> A GLYPH IS BEING SPOKEN'); }
  else log('>>> the legend speaks in words');
};
