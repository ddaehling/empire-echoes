/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(1500);
  await page.evaluate(() => { location.hash = '#year=1955&sel=kenya'; });
  await page.waitForTimeout(2200);
  const m = await page.evaluate(() => {
    const d = document.querySelector('#dossier');
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    return { rect: {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}, pos: cs.position, z: cs.zIndex, overflow: cs.overflowY, vis: cs.visibility, disp: cs.display, docW: document.documentElement.scrollWidth, winW: innerWidth };
  });
  log('mobile dossier:', JSON.stringify(m));
  await shot('mobile-kenya');
  // scroll inside the sheet
  await page.evaluate(() => { const d=document.querySelector('#dossier'); (d.scrollTo? d: d.querySelector('.dossier__body')).scrollTop = 900; });
  await page.waitForTimeout(400);
  await shot('mobile-scrolled');
  log('horizontal overflow?', m.docW > m.winW ? 'YES ' + m.docW + ' > ' + m.winW : 'no');
};
