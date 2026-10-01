/**
 * p02r10/framing.js — does the beat's own subject fit the band it was given?
 *
 * For every step of the authored path this prints, for the unit the beat
 * selects: its rectangle on the plate, its size as a share of the band, and
 * how far its centre sits from the band's centre. The phone critic's charge —
 * "at 390x844 the step-17 band spends 55% of its 192px on empty ocean" — is
 * exactly the last of those three numbers.
 */
const STEPS = [3, 5, 9, 11, 13, 17, 18, 21];
module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  for (const st of STEPS) {
    await page.goto(base + '#tour=thirty&step=' + st, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const M = window.__map, P = M.plate;
      const cv = document.querySelector('.map canvas').getBoundingClientRect();
      const band = { w: Math.round(cv.width), h: Math.round(cv.height) };
      const sel = [...(P.selectedUnits || [])];
      const uid = sel[0] || null;
      const s = uid ? P.unitScreen(uid) : null;
      const cam = P.camera();
      return { band, uid, k: +P.view.k.toFixed(2),
        subj: s ? { x: Math.round(s.x0), y: Math.round(s.y0), w: Math.round(s.w), h: Math.round(s.h) } : null,
        offCentreY: s ? Math.round(((s.y0 + s.y1) / 2) - band.h / 2) : null,
        offCentreX: s ? Math.round(((s.x0 + s.x1) / 2) - band.w / 2) : null,
        spanW: Math.round(cam.availW / cam.base / P.view.k), spanH: Math.round(cam.availH / cam.base / P.view.k),
        labels: P.labelsDrawn.length };
    });
    const pctW = r.subj && r.band.w ? Math.round(100 * r.subj.w / r.band.w) : 0;
    const pctH = r.subj && r.band.h ? Math.round(100 * r.subj.h / r.band.h) : 0;
    log('step ' + String(st).padStart(2) + '  band ' + r.band.w + 'x' + r.band.h + '  k=' + String(r.k).padStart(6)
      + '  subject ' + (r.uid || '-') + ' ' + (r.subj ? r.subj.w + 'x' + r.subj.h + 'px (' + pctW + '% x ' + pctH + '% of the band)' : 'not drawn')
      + '  centre off by ' + r.offCentreX + ',' + r.offCentreY + 'px  visible world ' + r.spanW + 'x' + r.spanH
      + '  ' + r.labels + ' labels');
    if (st === 17 || st === 9) await shot('step' + st);
  }
};
