module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await shot('p-landing');
  const measure = async (tag) => {
    const m = await page.evaluate(() => {
      const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      return {
        vw: innerWidth, vh: innerHeight,
        map: q('#map') || q('.app__map') || q('[class*="map__"]'),
        svg: q('svg'),
        sheet: q('#sheet'),
        timeline: q('#timeline') || q('.app__timeline'),
        zoom: q('.map__zoom') ? (() => { const e = document.querySelector('.map__zoom').parentElement; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })() : null,
        cloze: q('.cl-say') || q('[class*="cl-say"]'),
        clozeBlanks: document.querySelectorAll('.cl-say__blank').length,
      };
    });
    log(tag, JSON.stringify(m));
    return m;
  };
  await measure('PHONE landing');
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1800);
  await shot('p-beat1');
  await measure('PHONE beat1');
  const heads = await page.evaluate(() => [...document.querySelectorAll('header button, .app__chrome button, [class*="bar__"] button')].filter(b=>b.offsetParent).map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\s+/g,' ').trim().slice(0,40)));
  log('MASTHEAD beat1', JSON.stringify(heads));
  for (let i=0;i<4;i++){ const n=page.locator('button.tr-bar__next'); if(!await n.count())break; try{await n.first().click({force:true,timeout:3000});}catch(e){} await page.waitForTimeout(1000); }
  await shot('p-beat5');
  await measure('PHONE beat5');
  log('TEXT', (await page.evaluate(()=> (document.querySelector('#sheet')||document.body).innerText)).slice(0,1200));
};
