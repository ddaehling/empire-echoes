/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const hash = process.env.P04HASH || '#year=1857&sel=british-india';
  await page.goto('http://localhost:8777/app/' + hash, { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const box = await page.evaluate(() => {
    const n = document.querySelector('.app__dossier');
    const r = n.getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  await page.screenshot({ path: require('path').join(process.env.INSPECT_OUT || '/tmp', 'panel-fold.png'), clip: box });
  log('clip ' + JSON.stringify(box));
  // section heights
  const rows = await page.evaluate(() => {
    const out = [];
    for (const s of document.querySelectorAll('.dossier .dsr__block, .dossier .dsr__contents, .dossier > .dsr__below > p')) {
      out.push({ b: s.dataset.block || s.className, h: Math.round(s.getBoundingClientRect().height), w: (s.innerText||'').split(/\s+/).filter(Boolean).length });
    }
    return out;
  });
  log('SECTIONS:\n' + rows.map(r => String(r.h).padStart(6) + 'px ' + String(r.w).padStart(5) + 'w  ' + r.b).join('\n'));
  log('ERRORS ' + JSON.stringify(errs));
};
