// Do map, timeline, legend and dossier agree about year, selection and definition?
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  const read = async (tag) => {
    const r = await page.evaluate(() => {
      const t = s => (document.querySelector(s)?.innerText || '').replace(/\s+/g,' ').trim();
      const s = window.BEA.store.getState();
      return {
        state: { year: s.year, sel: s.selectedTerritoryId, hash: location.hash },
        appAttrs: { ...document.querySelector('#app').dataset },
        note: t('.stage__note').slice(0,220),
        legend: t('.stage__legend').slice(0,260),
        furniture: t('.map__furniture').slice(0,200),
        timelineHead: t('[data-mount="timeline"]').slice(0,200),
        dossierHead: t('[data-mount="dossier"]').slice(0,220),
      };
    });
    log(tag, JSON.stringify(r, null, 1));
  };
  await read('BOOT');
  for (const k of ['2','3','4','1']) {
    await page.keyboard.press(k); await page.waitForTimeout(900);
    await read('DEF-' + k);
    await shot('def-' + k);
  }
};
