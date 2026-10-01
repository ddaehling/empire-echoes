/** p02r11/peek.js — the peek strip: what the map draws in it, and what
 *  happens to the framing when the student presses Map. */
module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  const ready = async () => {
    await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA
      && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1500);
  };
  const read = async (tag) => {
    const m = await page.evaluate(() => {
      const P = window.__map.plate;
      const cv = document.querySelector('.map__plate').getBoundingClientRect();
      const sel = P.labelsDrawn.map((l) => l.text);
      const cam = P.camera() || {}; const kk = cam.k != null ? cam.k : (P.view && P.view.k);
      // the beat's subject, if the plate is highlighting one
      const hi = window.__map.module && window.__map.module.highlight ? [...window.__map.module.highlight] : [];
      const s = hi.length ? P.unitScreen(hi[0]) : null;
      return {
        band: Math.round(cv.width) + 'x' + Math.round(cv.height),
        k: +Number(kk || 0).toFixed(2), labels: sel,
        fit: document.documentElement.getAttribute('data-tour-fit'),
        subj: s ? { id: hi[0], w: Math.round(s.w), h: Math.round(s.h), cy: Math.round(s.py), py: Math.round(100 * s.py / cv.height) } : null,
      };
    });
    log(tag + '  band ' + m.band + '  k=' + m.k + '  fit=' + m.fit
      + '  subject ' + (m.subj ? m.subj.id + ' ' + m.subj.w + 'x' + m.subj.h + ' at ' + m.subj.py + '% down the band' : '-')
      + '  names: ' + JSON.stringify(m.labels));
    return m;
  };
  for (const step of [17, 1, 9]) {
    await page.goto(base + '#tour=thirty&step=' + step, { waitUntil: 'load' });
    await ready();
    await read('step' + step + ' peek ');
    await shot('step' + step + '-peek');
    const btn = await page.$('button:has-text("Map"), .tr-panel__map, [data-act="fit"]');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(1200);
      await read('step' + step + ' open ');
      await shot('step' + step + '-open');
    } else log('step' + step + ': no Map control found');
  }
};
