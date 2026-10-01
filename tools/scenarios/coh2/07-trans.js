module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.BEA.store.dispatch('select','bengal-presidency'));
  for (const t of [150, 250, 350, 500, 800, 1200]) { await page.waitForTimeout(t === 150 ? 150 : 0); }
  // take shots at intervals
  await shot('t150');
  await page.waitForTimeout(200); await shot('t350');
  await page.waitForTimeout(300); await shot('t650');
  await page.waitForTimeout(600); await shot('t1250');
  // can the dossier scroll?
  const sc = await page.evaluate(() => {
    const out = [];
    let el = document.querySelector('[data-mount="dossier"]');
    while (el && el !== document.documentElement) { const cs = getComputedStyle(el); out.push({ c: el.className||el.id||el.tagName, oy: cs.overflowY, sh: el.scrollHeight, ch: el.clientHeight }); el = el.parentElement; }
    return out;
  });
  log('DOSSIER ANCESTRY', JSON.stringify(sc, null, 1));
  const box = await page.locator('[data-mount="dossier"]').boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + 400);
  await page.mouse.wheel(0, 1200); await page.waitForTimeout(600);
  await shot('dossier-after-wheel');
  log('scrollTop after wheel', JSON.stringify(await page.evaluate(() => {
    const els=[...document.querySelectorAll('*')].filter(e=>e.scrollTop>0).map(e=>({c:e.className||e.tagName, st:e.scrollTop}));
    return { els, docTop: document.documentElement.scrollTop };
  })));
};
