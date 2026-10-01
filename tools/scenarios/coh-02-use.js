/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Coherence pass: use it like a student.
module.exports = async ({ page, shot, log }) => {
  const ready = () => page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', { timeout: 30000 });
  await ready(); await page.waitForTimeout(900);

  const geom = async (label) => {
    const g = await page.evaluate(() => {
      const pick = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {sel, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}; };
      return { vw: innerWidth, vh: innerHeight,
        stage: pick('.app__stage'), time: pick('.app__time'), dossier: pick('.app__dossier'),
        legend: pick('.stage__legend'), note: pick('.stage__note'), foot: pick('.app__foot'), bar: pick('.app__bar') };
    });
    log(label, JSON.stringify(g));
  };
  await geom('GEOM landing');

  // 1. click a territory on the map — try India
  const clicked = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-unit-id]')];
    const t = els.find(e => /bengal|india/i.test(e.getAttribute('data-unit-id')||''));
    if (t) { t.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); t.dispatchEvent(new PointerEvent('pointerup',{bubbles:true})); t.dispatchEvent(new MouseEvent('click',{bubbles:true})); return t.getAttribute('data-unit-id'); }
    return null;
  });
  log('clicked unit:', clicked);
  await page.waitForTimeout(1200);
  await shot('10-dossier-open');
  await geom('GEOM dossier');
  log('dossier text:\n' + (await page.evaluate(() => document.querySelector('[data-mount=dossier]')?.innerText || 'NONE')).slice(0,3000));

  // 2. scrub the year forward past independence
  await page.evaluate(() => window.BEA.store.act.setYear(1960));
  await page.waitForTimeout(1200);
  await shot('11-year-1960-selection-dead');
  log('state after 1960:', await page.evaluate(() => JSON.stringify({y:BEA.store.getState().year, sel:BEA.store.getState().selectedTerritoryId})));
  log('dossier at 1960:\n' + (await page.evaluate(() => document.querySelector('[data-mount=dossier]')?.innerText || 'NONE')).slice(0,1500));

  // 3. definition switch
  await page.keyboard.press('3');
  await page.waitForTimeout(900);
  await shot('12-def-controlled');
  // 4. a year where nothing is British
  await page.evaluate(() => window.BEA.store.act.setYear(1200));
  await page.waitForTimeout(1200);
  await shot('13-year-1200-empty');
  log('1200 legend:\n' + (await page.evaluate(() => document.querySelector('[data-mount=legend]')?.innerText || 'NONE')).slice(0,1200));
  log('1200 note:\n' + (await page.evaluate(() => document.querySelector('[data-mount=stage-note]')?.innerText || 'NONE')).slice(0,800));
  log('1200 timeline:\n' + (await page.evaluate(() => document.querySelector('[data-mount=timeline]')?.innerText || 'NONE')).slice(0,1200));
};
