module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(() => BEA.store.dispatch('setYear', 1948));
  await page.waitForTimeout(700);
  log(JSON.stringify(await page.evaluate(() => {
    const b = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs=getComputedStyle(e); return { s, y:Math.round(r.y), h:Math.round(r.height), bot:Math.round(r.bottom), of:cs.overflow, ga:cs.gridArea }; };
    const tl = document.querySelector('.tl');
    return { rows: tl && getComputedStyle(tl).gridTemplateRows, areas: tl && getComputedStyle(tl).gridTemplateAreas,
      boxes: ['section.tl','.tl__deck','.tl__changes','.tl__track','.tl-chg','.tl__body','.tl-ax','.tl-ax__rail','.tl-mark','.tl-rate','.tl-spine'].map(b) };
  }), null, 1));
};
