/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));

  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await shot('01-bengal-1765');

  // is there a dossier slot?
  const info = await page.evaluate(() => {
    const el = document.querySelector('[data-slot="dossier"], #dossier, .dossier');
    const out = {};
    out.found = !!el;
    if (el) {
      const r = el.getBoundingClientRect();
      out.rect = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      out.scrollH = el.scrollHeight;
      out.clientH = el.clientHeight;
      out.text = el.innerText;
    }
    out.slots = [...document.querySelectorAll('[data-slot]')].map(n => n.getAttribute('data-slot'));
    return out;
  });
  log('dossier found:', info.found, JSON.stringify(info.rect), 'scrollH', info.scrollH, 'clientH', info.clientH);
  log('slots:', JSON.stringify(info.slots));
  log('---DOSSIER TEXT---\n' + (info.text || '(none)'));
  log('ERRORS:', JSON.stringify(errs.slice(0, 20)));
};
