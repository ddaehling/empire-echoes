module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2600);
  log(JSON.stringify(await page.evaluate(() => {
    const b = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { s, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), z:cs.zIndex, pos:cs.position }; };
    return [ '#stage', '.stage__map', '.map', '.map__frame', '.map__furniture', '.map__switch', '.map__controls', '.byline', '.legend', 'section.tl', '.tl__head', '.tl__year', '[data-mount="timeline"]', '.tl-ax' ].map(b);
  }), null, 1));
  log('MAP CLASSES', await page.evaluate(() => document.querySelector('.map').className));
};
