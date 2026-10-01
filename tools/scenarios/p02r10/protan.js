/**
 * p02r10/protan.js — the 1900 plate as a protanope sees it, with the heavy
 * engraving off and on. The canvas is read back, put through the Vienot
 * protanope transform and written to a second canvas laid over the map, so the
 * screenshot IS the simulation rather than a description of one.
 */
module.exports = async ({ page, shot, log }) => {
  const base = page.url().split('#')[0];
  await page.goto(base + '#year=1900', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);

  const simulate = async (heavy) => {
    await page.evaluate((h) => {
      const mod = window.BEA.registry.get('map').mod;
      mod.weakFills = h ? mod.weakFills : new Set();
      mod.__savedWeak = mod.__savedWeak || null;
      mod.paintSig = '';
      mod._repaint(true);
    }, heavy);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const cv = document.querySelector('.map canvas');
      const g = cv.getContext('2d');
      const img = g.getImageData(0, 0, cv.width, cv.height);
      const D = img.data;
      const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const gam = (c) => { const v = Math.max(0, Math.min(1, c)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); };
      for (let i = 0; i < D.length; i += 4) {
        const R = lin(D[i]), G = lin(D[i + 1]), B = lin(D[i + 2]);
        const L = 17.8824 * R + 43.5161 * G + 4.11935 * B;
        const M = 3.45565 * R + 27.1554 * G + 3.86714 * B;
        const S = 0.0299566 * R + 0.184309 * G + 1.46709 * B;
        const L2 = 2.02344 * M - 2.52581 * S;
        D[i] = gam(0.0809444479 * L2 - 0.130504409 * M + 0.116721066 * S);
        D[i + 1] = gam(-0.0102485335 * L2 + 0.0540193266 * M - 0.113614708 * S);
        D[i + 2] = gam(-0.000365296938 * L2 - 0.00412161469 * M + 0.693511405 * S);
      }
      g.putImageData(img, 0, 0);
    });
  };

  await simulate(false);
  log('protanope simulation, heavy engraving OFF');
  await shot('protan-before', '.stage__map');
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__map && window.__map.plate && window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(1600);
  await simulate(true);
  log('protanope simulation, heavy engraving ON');
  await shot('protan-after', '.stage__map');
};
