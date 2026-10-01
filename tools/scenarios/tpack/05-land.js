/* tpack/05-land — does #tour=core&step=N land where the printed plan says? */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  const want = await page.evaluate(() => window.BEA.tourStepIndex.routes.core.beats);
  log('WANT ' + JSON.stringify(want));

  for (const [beat, n] of Object.entries(want)) {
    await page.evaluate((s) => { location.hash = '#tour=core&step=' + s; }, n);
    await page.waitForTimeout(650);
    const got = await page.evaluate(() => {
      const s = window.BEA.store.getState();
      const c = document.querySelector('.tr-count');
      const mk = document.querySelector('.tr-lede__mark') || document.querySelector('.tr-panel__mark');
      const ti = document.querySelector('.tr-panel__title');
      return { tourStep: s.tourStep, count: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 30) : null,
               mark: mk ? mk.innerText.slice(0, 40) : null, title: ti ? ti.innerText.slice(0, 50) : null,
               body: document.body.dataset.beat || null };
    });
    log(beat.padEnd(16) + ' step ' + String(n).padStart(2) + ' -> ' + JSON.stringify(got));
  }
  await shot('landed');
};
