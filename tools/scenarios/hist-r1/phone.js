module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const m = async (tag) => {
    const r = await page.evaluate(() => {
      const el = document.querySelector('.map, #map, [class*="map__plate"], svg.map__svg');
      const b = el ? el.getBoundingClientRect() : null;
      return { map: b ? Math.round(b.width)+'x'+Math.round(b.height) : 'none', vw: innerWidth, vh: innerHeight,
               overflow: document.documentElement.scrollWidth > innerWidth };
    });
    log(tag + ' ' + JSON.stringify(r));
  };
  await m('landing');
  await shot('phone-landing');
  const s = page.locator('button:has-text("Start the lesson")').first();
  if (await s.count()) { await s.click(); await page.waitForTimeout(1500); }
  await m('beat1'); await shot('phone-beat1');
  for (let i=0;i<8;i++){ const n=page.locator('button:has-text("Next")').first(); if(!await n.count())break; await n.click().catch(()=>{}); await page.waitForTimeout(500);}
  await m('beat-later'); await shot('phone-beat-later');
  const t = await page.evaluate(()=>document.body.innerText);
  log('CLOZE PRESENT: ' + /It started as/.test(t));
  log('TEXT:\n'+t.replace(/Arrow keys[\s\S]*?puts it back\./,'[kbd]').slice(0,1800));
};
