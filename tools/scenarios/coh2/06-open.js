module.exports = async ({ page, shot, log }) => {
  const probe = async (tag) => log(tag, JSON.stringify(await page.evaluate(() => {
    const r = el => { if(!el) return null; const b=el.getBoundingClientRect(); return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]; };
    const q = s => r(document.querySelector(s));
    return {
      docScroll: document.documentElement.scrollHeight, vh: innerHeight,
      app: q('#app'), stage: q('#stage'), plate: q('.map__frame'),
      furniture: q('.map__furniture'), furnClass: document.querySelector('.map__furniture')?.className,
      rail: q('.map__rail'), note: q('.stage__note'), legend: q('.stage__legend'),
      timeline: q('[data-mount="timeline"]'), dossier: q('[data-mount="dossier"]'),
      defcard: q('.map__defcard, .map__def, [class*="def"]'),
    };
  }), null, 0));
  await page.waitForTimeout(2200);
  await probe('CLOSED');
  await page.evaluate(() => window.BEA.store.dispatch('select','bengal-presidency'));
  await page.waitForTimeout(1400);
  await probe('OPEN');
  await shot('open');
  await page.evaluate(()=>window.scrollTo(0, 99999)); await page.waitForTimeout(400); await shot('scrolled-bottom');
};
